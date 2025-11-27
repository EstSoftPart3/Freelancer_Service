package com.example.demo.domain.notification.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.notification.dto.request.NotificationRequest;
import com.example.demo.domain.notification.dto.response.NotificationModalResponse;
import com.example.demo.domain.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
	
	private final NotificationService notificationService;
	
	@PostMapping
	public ResponseEntity<ApiResponse<NotificationModalResponse>> createNotification(
			@RequestBody NotificationRequest request,
			@RequestParam Long userSq){
		
		NotificationModalResponse response = notificationService.createNotification(request,userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "알림 전송 성공", null));
	}
	
	
}
