package com.example.demo.common.viewcount;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 조회수 중복 증가를 막기 위한 공용 서비스.
 * (resource, sq, visitor) 키가 24시간 내 이미 존재하면 재조회로 간주해 카운트를 스킵한다.
 * Redis 장애 시에는 조회수 증가가 막히지 않도록 첫 조회로 간주하고 경고 로그만 남긴다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ViewCountDedupService {

	private static final Duration TTL = Duration.ofHours(24);

	private final StringRedisTemplate redisTemplate;

	public boolean isFirstView(String resource, Long sq, Long userSq, HttpServletRequest request) {
		String visitor = resolveVisitor(userSq, request);
		String key = "viewdedup:" + resource + ":" + sq + ":" + visitor;

		try {
			Boolean firstView = redisTemplate.opsForValue().setIfAbsent(key, "1", TTL);
			return Boolean.TRUE.equals(firstView);
		} catch (Exception e) {
			log.warn("조회수 중복 방지용 Redis 조회 실패 - 첫 조회로 간주합니다. resource={}, sq={}", resource, sq, e);
			return true;
		}
	}

	private String resolveVisitor(Long userSq, HttpServletRequest request) {
		if (userSq != null) {
			return "u" + userSq;
		}

		String forwardedFor = request.getHeader("X-Forwarded-For");
		String ip = (forwardedFor != null && !forwardedFor.isBlank())
				? forwardedFor.split(",")[0].trim()
				: request.getRemoteAddr();

		return "ip:" + ip;
	}
}
