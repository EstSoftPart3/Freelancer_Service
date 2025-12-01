package com.example.demo.domain.notification.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.notification.dto.response.NotificationPageResponse;
import com.example.demo.domain.notification.dto.response.NotificationResponse;
import com.example.demo.domain.notification.service.NotificationService;
import com.example.demo.domain.notification.sse.SseEmitterManager;
import com.example.demo.domain.user.util.JwtAuthenticationToken;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
	
	private final NotificationService notificationService;
    private final SseEmitterManager emitterManager;
	
    
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal Long userSq) {
    	return emitterManager.createEmitter(userSq);
    }
    
    
	@GetMapping
	public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
			@AuthenticationPrincipal Long userSq) {
		List<NotificationResponse> response = notificationService.getUnreadNotifications(userSq);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "읽지 않은 알림 목록 조회 성공", response));
	}
	
	@GetMapping("/page")
	public ResponseEntity<ApiResponse<NotificationPageResponse>> getAllNotifications(
			@AuthenticationPrincipal Long userSq,
			@RequestParam(required = false) Long cursor,
			@RequestParam(defaultValue = "20") int size
			){
		NotificationPageResponse response = notificationService.getAllNotifications(userSq, cursor, size);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "알림 페이지 조회 성공", response));
	}
	
	@PatchMapping("/{notificationSq}")
	public ResponseEntity<ApiResponse<Void>> changeReadStatus(
			@PathVariable Long notificationSq,
			@AuthenticationPrincipal JwtAuthenticationToken token) {
		notificationService.changeReadStatus(notificationSq, token.getUserSq());
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "알림 읽음 처리 완료", null));
	}
	
	@DeleteMapping("/{notificationSq}")
	public ResponseEntity<ApiResponse<Void>> deleteNotification(
			@PathVariable Long notificationSq,
			@AuthenticationPrincipal JwtAuthenticationToken token) {
		notificationService.deleteNotification(notificationSq, token.getUserSq());
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "알림 삭제 처리 완료", null));
	}
}
