package com.example.demo.domain.notification.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.notification.dto.request.NotificationSettingUpdateRequest;
import com.example.demo.domain.notification.dto.response.NotificationSettingResponse;
import com.example.demo.domain.notification.service.NotificationSettingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications/setting")
@RequiredArgsConstructor
public class NotificationSettingController {

    private final NotificationSettingService notificationSettingService;

    // ✅ 조회: GET /api/notifications/setting
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> getMySetting(
            @AuthenticationPrincipal Long userSq
    ) {
        NotificationSettingResponse response = notificationSettingService.getOrCreateMySetting(userSq);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 설정 조회 성공", response)
        );
    }

    // ✅ 변경: PATCH /api/notifications/setting
    @PatchMapping
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> updateMySetting(
            @AuthenticationPrincipal Long userSq,
            @RequestBody NotificationSettingUpdateRequest req
    ) {
        NotificationSettingResponse response = notificationSettingService.updateMySetting(userSq, req);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 설정 변경 성공", response)
        );
    }

    // ✅ 초기화: POST /api/notifications/setting/reset
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> resetMySetting(
            @AuthenticationPrincipal Long userSq
    ) {
        NotificationSettingResponse response = notificationSettingService.resetMySetting(userSq);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 설정 초기화 성공", response)
        );
    }
}
