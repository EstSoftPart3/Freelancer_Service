package com.example.demo.domain.notification.core.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder
public class NotificationCreateDTO {
    private Long notificationSq;
    private Long reseverUserSq;
    private Long notificationTargetTypeCd;
    private Long notificationTargetSq;
    private String notificationTtl;
    private String notificationTxt;
}
