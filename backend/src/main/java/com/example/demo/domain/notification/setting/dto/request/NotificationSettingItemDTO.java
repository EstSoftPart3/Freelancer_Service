package com.example.demo.domain.notification.setting.dto.request;

import lombok.Data;

@Data
public class NotificationSettingItemDTO {
    private Long notificationTypeCd; // 2200
    private String receiveYn;        // Y/N
}
