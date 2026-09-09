package com.example.demo.domain.user.dto.request;

import lombok.Data;

@Data
public class NotificationRequestDTO {
    private Long receiverUserSq;
    private Long senderUserSq;
    private Long notificationTypeCd;
    private String notificationContentTxt;
    private String notificationTargetUrl;
}