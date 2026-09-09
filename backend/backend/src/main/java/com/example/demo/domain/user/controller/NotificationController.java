package com.example.demo.domain.user.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.user.dto.response.NotificationResponseDTO;
import com.example.demo.domain.user.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 현재 접속한 사용자의 알림 목록 조회
    @GetMapping
    public List<NotificationResponseDTO> getNotifications(@AuthenticationPrincipal Long userSq) {
        return notificationService.getNotificationList(userSq);
    }

    // 읽지 않은 알림 개수
    @GetMapping("/unread-count")
    public int getUnreadCount(@AuthenticationPrincipal Long userSq) {
        return notificationService.getUnreadCount(userSq);
    }

    // 알림 읽음 처리
    @PatchMapping("/{notificationSq}")
    public void readNotification(@PathVariable Long notificationSq) {
        notificationService.markAsRead(notificationSq);
    }

    // 알림 삭제
    @DeleteMapping("/{notificationSq}")
    public void deleteNotification(@PathVariable Long notificationSq) {
        notificationService.removeNotification(notificationSq);
    }

    // 모두 읽음 처리
    @PatchMapping
    public void readAllNotifications(@AuthenticationPrincipal Long userSq) {
        notificationService.markAllAsRead(userSq);
    }

    // 전체 삭제
    @DeleteMapping
    public void deleteAllNotifications(@AuthenticationPrincipal Long userSq) {
        notificationService.removeAllNotifications(userSq);
    }
}