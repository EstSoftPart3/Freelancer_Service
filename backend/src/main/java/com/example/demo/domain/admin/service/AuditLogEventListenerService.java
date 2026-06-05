package com.example.demo.domain.admin.service;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import com.example.demo.domain.admin.dto.AuditLogEventDTO;
import com.example.demo.domain.admin.mapper.AdminAuditMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogEventListenerService {

	private final AdminAuditMapper adminAuditMapper;
	
	@EventListener
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void handleAuditLogEvent(AuditLogEventDTO eventDto) {
		try {
			// IP 자동 추출 로직
			try {
				ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
				if (attributes != null) {
					HttpServletRequest request = attributes.getRequest();
					String ip = request.getHeader("X-Forwarded-For");
					if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
						ip = request.getHeader("Proxy-Client-IP");
					}
					if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
						ip = request.getHeader("WL-Proxy-Client-IP");
					}
					if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
						ip = request.getHeader("HTTP_CLIENT_IP");
					}
					if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
						ip = request.getHeader("HTTP_X_FORWARDED_FOR");
					}
					if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
						ip = request.getRemoteAddr();
					}
					
					// 다중 프록시인 경우 첫 번째 IP 추출
					if (ip != null && ip.contains(",")) {
						ip = ip.split(",")[0].trim();
					}
					
					if (ip != null && !ip.isEmpty()) {
						eventDto.setIpAddress(ip);
					}
				}
			} catch (Exception e) {
				log.warn("IP 추출 실패: {}", e.getMessage());
			}

			adminAuditMapper.insertAuditLog(eventDto);
			log.info("활동 로그 자동 기록 성공: [{} - {}]", eventDto.getActionType(), eventDto.getTargetType());
		} catch (Exception e) {
			log.error("활동 로그 자동 기록 실패: {}", e.getMessage());
			
		}
	}
}
