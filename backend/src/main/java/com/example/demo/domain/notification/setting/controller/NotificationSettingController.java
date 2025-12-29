package com.example.demo.domain.notification.setting.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.notification.setting.dto.request.NotificationSettingPatchRequestDTO;
import com.example.demo.domain.notification.setting.dto.response.NotificationSettingResponseDTO;
import com.example.demo.domain.notification.setting.service.NotificationSettingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications/settings")
@RequiredArgsConstructor
public class NotificationSettingController {

    private final NotificationSettingService settingService;

    @GetMapping
    public ResponseEntity<NotificationSettingResponseDTO> get(
            Authentication authentication,
            @AuthenticationPrincipal Object principal
    ) {
        Long userSq = requireUserSq(authentication, principal);
        System.out.println("[settings] userSq=" + userSq);
        return ResponseEntity.ok(settingService.get(userSq));
    }

    @PatchMapping
    public ResponseEntity<NotificationSettingResponseDTO> patch(
            Authentication authentication,
            @AuthenticationPrincipal Object principal,
            @RequestBody NotificationSettingPatchRequestDTO req
    ) {
        Long userSq = requireUserSq(authentication, principal);
        return ResponseEntity.ok(settingService.patch(userSq, req));
    }

    private Long requireUserSq(Authentication authentication, Object principal) {
        Long userSq = extractUserSq(authentication, principal);
        if (userSq == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다."
            );
        }
        return userSq;
    }

    private Long extractUserSq(Authentication authentication, Object principal) {
        if (authentication != null && authentication.getPrincipal() != null) {
            Object p = authentication.getPrincipal();

            if (p instanceof Long) return (Long) p;
            if (p instanceof String) {
                try { return Long.parseLong((String) p); } catch (Exception ignored) {}
            }
        }

        if (principal instanceof Long) return (Long) principal;
        if (principal instanceof String) {
            try { return Long.parseLong((String) principal); } catch (Exception ignored) {}
        }

        return null;
    }
}
