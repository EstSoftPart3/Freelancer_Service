package com.example.demo.domain.notification.core.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.notification.core.dto.request.NotificationDeleteRequestDTO;
import com.example.demo.domain.notification.core.dto.request.NotificationReadRequestDTO;
import com.example.demo.domain.notification.core.dto.response.NotificationListResponseDTO;
import com.example.demo.domain.notification.core.service.NotificationService;
import com.example.demo.domain.notification.sse.SseEmitterManager;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterManager emitterManager;

    @GetMapping("/unread")
    public ResponseEntity<NotificationListResponseDTO> getUnreadNotifications(
        Authentication authentication,
        @AuthenticationPrincipal Object principal,
        @RequestParam(name = "page", required = false) Integer page,
        @RequestParam(name = "size", required = false) Integer size,
        @RequestParam(name = "deleteStatus", required = false) Long deleteStatus
    ) {
        Long userSq = requireUserSq(authentication, principal);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userSq, page, size, deleteStatus));
    }

    
    
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(Authentication authentication, @AuthenticationPrincipal Object principal) {
        try {
            Long userSq = extractUserSq(authentication, principal);
            if (userSq == null) return emitAndClose("ERROR", "UNAUTHORIZED");

            notificationService.validateUserForSse(userSq); // 서비스는 검증만
            return emitterManager.createEmitter(userSq);

        } catch (Exception e) {
            log.warn("SSE subscribe failed", e);
            return emitAndClose("ERROR", "SUBSCRIBE_FAILED");
        }
    }
    
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<NotificationListResponseDTO> getNotifications(
        Authentication authentication,
        @AuthenticationPrincipal Object principal,
        @RequestParam(name="page", required=false) Integer page,
        @RequestParam(name="size", required=false) Integer size,
        @RequestParam(name="deleteStatus", required=false) Long deleteStatus
		) {
    Long userSq = requireUserSq(authentication, principal);
    return ResponseEntity.ok(notificationService.getNotifications(userSq, page, size, deleteStatus));
	}


    @PatchMapping(value = "/read",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> readNotifications(
            Authentication authentication,
            @AuthenticationPrincipal Object principal,
            @RequestBody NotificationReadRequestDTO request
    ) {
        Long userSq = requireUserSq(authentication, principal);

        notificationService.readNotifications(userSq, request);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 읽음 처리 완료", null)
        );
    }

    @PatchMapping(value = "/delete",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> deleteNotifications(
            Authentication authentication,
            @AuthenticationPrincipal Object principal,
            @RequestBody NotificationDeleteRequestDTO request
    ) {
        Long userSq = requireUserSq(authentication, principal);

        notificationService.deleteNotifications(userSq, request);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "알림 삭제 처리 완료", null)
        );
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

    private SseEmitter emitAndClose(String eventName, String data) {
        SseEmitter emitter = new SseEmitter(5_000L);
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (Exception ignored) {
        } finally {
            emitter.complete();
        }
        return emitter;
    }

    @GetMapping(value = "/trash", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NotificationListResponseDTO> getTrash(
        Authentication authentication,
        @AuthenticationPrincipal Object principal,
        @RequestParam(name = "page", required = false) Integer page,
        @RequestParam(name = "size", required = false) Integer size
    ){
        Long userSq = requireUserSq(authentication, principal);

        Long trashStatus = 2302L;

        return ResponseEntity.ok(notificationService.getNotifications(userSq, page, size, trashStatus));
    }

    @PatchMapping(value = "/restore",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> restoreNotifications(
        Authentication authentication,
        @AuthenticationPrincipal Object principal,
        @RequestBody NotificationDeleteRequestDTO request
        ) {
        Long userSq = requireUserSq(authentication, principal);

        notificationService.restoreNotifications(userSq, request);

        return ResponseEntity.ok(
            ApiResponse.of(HttpStatus.OK, "알림 복구 처리 완료", null)
        );
    }

    @PatchMapping(value = "/permanent-delete",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> permanentDeleteNotifications(
        Authentication authentication,
        @AuthenticationPrincipal Object principal,
        @RequestBody NotificationDeleteRequestDTO request
    ) {
        Long userSq = requireUserSq(authentication, principal);

        notificationService.permanentDeleteNotifications(userSq, request);

        return ResponseEntity.ok(
            ApiResponse.of(HttpStatus.OK, "알림 영구 삭제 처리 완료", null)
        );
    }
}
