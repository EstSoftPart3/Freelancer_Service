package com.example.demo.domain.notification.sse;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.domain.notification.dto.response.NotificationResponse;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SseEmitterManager {
	
	private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

	
	public SseEmitter createEmitter(Long userSq) {		
		SseEmitter emitter = new SseEmitter(3600000L);  // 1시간
		emitters.put(userSq, emitter);
		
		emitter.onCompletion(() -> {
			emitters.remove(userSq);
			log.info("SSE 연결 종료: userSq={}", userSq);
		});
		
		emitter.onTimeout(() -> {
			emitters.remove(userSq);
			log.info("SSE 타임아웃: userSq={}", userSq);
		});
		
		emitter.onError((e) -> {
			emitters.remove(userSq);
			log.error("SSE 에러: userSq={}", userSq);
		});
		
		try {
			emitter.send(SseEmitter.event()
					.name("connect")
					.data("connected"));
		} catch (IOException e) {
			emitters.remove(userSq);
		}
		
		return emitter;
	}
	
	// 알림 전송
	public void sendToUser(Long userSq, NotificationResponse notification) {
		SseEmitter emitter = emitters.get(userSq);
		if (emitter != null) {
			try {
				emitter.send(SseEmitter.event()
						.name("notification")
						.data(notification));
				log.info("알림 전송 성공");
			} catch (IOException e) {
				emitters.remove(userSq);
				log.error("알림 전송 실패 userSq: {}", userSq);
			}
		} else {
			log.info("SSE 연결 없음  userSq: {}", userSq);
		}
	}
}
