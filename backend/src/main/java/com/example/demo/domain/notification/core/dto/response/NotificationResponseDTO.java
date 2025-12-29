package com.example.demo.domain.notification.core.dto.response;


import java.time.LocalDateTime;

import com.example.demo.domain.notification.core.entity.Notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder
public class NotificationResponseDTO {

    private Long notificationSq;

    private Long notificationTargetTypeCd;
    private Long notificationTargetSq;

    private String notificationTtl;
    private String notificationTxt;

    private String notificationIsReadYn;
    private Long notificationDeleteStatus;
    private LocalDateTime notificationCreatedAtDtm;

    public static NotificationResponseDTO from(Notification n) {
        return NotificationResponseDTO.builder()
            .notificationSq(n.getNotificationSq())
            .notificationTargetTypeCd(n.getNotificationTargetTypeCd())
            .notificationTargetSq(n.getNotificationTargetSq())
            .notificationTtl(n.getNotificationTtl())
            .notificationTxt(n.getNotificationTxt())
            .notificationIsReadYn(n.getNotificationIsReadYn())
            .notificationDeleteStatus(n.getNotificationDeleteStatus())
            .build();
    }
}
