package com.example.demo.domain.notification.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;          // ✅ 추가
import org.springframework.web.bind.annotation.RequestBody;        // ✅ 추가
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.notification.dto.response.NotificationPageResponse;
import com.example.demo.domain.notification.dto.response.NotificationResponse;
import com.example.demo.domain.notification.service.NotificationService;
import com.example.demo.domain.notification.sse.SseEmitterManager;

import lombok.Getter;                                             // ✅ 추가
import lombok.RequiredArgsConstructor;
import lombok.Setter;                                             // ✅ 추가
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterManager emitterManager;

    /* ================= SSE 구독 ================= */

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal Long userSq) {
        return emitterManager.createEmitter(userSq);
    }

    /* ================= 읽지 않은 알림 (모달용) ================= */

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            @AuthenticationPrincipal Long userSq) {

        List<NotificationResponse> response =
                notificationService.getUnreadNotifications(userSq);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "읽지 않은 알림 목록 조회 성공", response));
    }

    /* ============================================================
       ✅ 페이지 번호 기반 API (페이지네이션 전용)
       프론트에서는 반드시 이 API 사용
       ============================================================ */

    @GetMapping("/page-number")
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getAllNotificationsByPage(
            @AuthenticationPrincipal Long userSq,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        NotificationPageResponse response =
                notificationService.getAllNotificationsByPage(userSq, page, size);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 페이지(번호) 조회 성공", response));
    }

    /* ================= 읽음 처리 ================= */

    @PatchMapping("/{notificationSq}")
    public ResponseEntity<ApiResponse<Void>> changeReadStatus(
            @PathVariable Long notificationSq,
            Authentication authentication) {

        Long userSq = (Long) authentication.getPrincipal();
        notificationService.changeReadStatus(notificationSq, userSq);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 읽음 처리 완료", null));
    }

    /* ================= 삭제 (소프트 삭제: 휴지통 이동) ================= */

    @DeleteMapping("/{notificationSq}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long notificationSq,
            Authentication authentication) {

        Long userSq = (Long) authentication.getPrincipal();
        notificationService.deleteNotification(notificationSq, userSq);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 삭제 처리 완료", null));
    }

    /* ============================================================
       ✅ 추가: 휴지통 API
       1) 휴지통 목록 조회(페이지네이션)
       2) 선택 복구
       3) 선택 영구삭제
       ============================================================ */

    // ✅ 1) 휴지통(삭제됨) 목록 조회
    @GetMapping("/trash")
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getTrashNotificationsByPage(
            @AuthenticationPrincipal Long userSq,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        NotificationPageResponse response =
                notificationService.getTrashNotificationsByPage(userSq, page, size);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "휴지통 알림 페이지(번호) 조회 성공", response));
    }

    // ✅ 2) 휴지통 복구 (선택 복구)
    @PostMapping("/trash/restore")
    public ResponseEntity<ApiResponse<Void>> restoreTrashNotifications(
            @AuthenticationPrincipal Long userSq,
            @RequestBody NotificationIdsRequest request) {

        notificationService.restoreNotifications(userSq, request.getNotificationIds());

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "휴지통 알림 복구 완료", null));
    }

    // ✅ 3) 휴지통 영구삭제 (선택 삭제) - 기존 DELETE 유지
    @DeleteMapping("/trash")
    public ResponseEntity<ApiResponse<Void>> deleteTrashNotificationsPermanently(
            @AuthenticationPrincipal Long userSq,
            @RequestBody NotificationIdsRequest request) {

        notificationService.deleteNotificationsPermanently(userSq, request.getNotificationIds());

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "휴지통 알림 영구삭제 완료", null));
    }

    // ✅ 3-1) 휴지통 영구삭제 (POST 버전 추가) ← 프론트가 이걸 호출함
    @PostMapping("/trash/delete")
    public ResponseEntity<ApiResponse<Void>> deleteTrashNotificationsPermanentlyByPost(
            @AuthenticationPrincipal Long userSq,
            @RequestBody NotificationIdsRequest request) {

        notificationService.deleteNotificationsPermanently(userSq, request.getNotificationIds());

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "휴지통 알림 영구삭제 완료", null));
    }

    // ✅ 요청 DTO (선택 복구/선택 삭제 공용)
    @Getter
    @Setter
    public static class NotificationIdsRequest {
        private List<Long> notificationIds;
    }
}
