package com.example.demo.domain.user.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class NotificationDTO {
    private Long notificationSq;
    private Long receiverUserSq;
    private Long senderUserSq;
    private Long notificationTypeCd;
    private String notificationContentTxt;
    private String notificationTargetUrl;
    private String notificationReadYn;
    private LocalDateTime notificationCreatedAtDtm;
    private String notificationIsDeletedYn;
}