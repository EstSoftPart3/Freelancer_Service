package com.example.demo.domain.notification.core.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder
public class NotificationDTO {
	
    private Long notificationSq;
    private Long userSq;

    private Long notificationTargetTypeCd;
    private Long notificationTargetSq;

    private String notificationTtl;
    private String notificationTxt;

    private String notificationIsReadYn;
    private Long notificationDeleteStatus;

    private LocalDateTime notificationCreateAtDtm;
    private LocalDateTime notificationDeleteAtDtm;
	
	
}
