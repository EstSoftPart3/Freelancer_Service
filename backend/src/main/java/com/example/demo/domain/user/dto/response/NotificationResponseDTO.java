package com.example.demo.domain.user.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationResponseDTO {
    private Long notificationSq;
    private String notificationContentTxt;
    private String notificationTargetUrl;
    private String notificationReadYn;
    private LocalDateTime notificationCreatedAtDtm;

    // 추가로 필요한 정보 (발신자 이름 등)
    private String senderNm;
}