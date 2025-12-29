package com.example.demo.domain.notification.setting.dto.response;

import lombok.Data;

@Data
public class NotificationSettingResponseDTO {
    private Long userSq;
    private String allNoticeYn;
    private String recruitNoticeYn;
    private String commentNoticeYn;
    private String scrapCompanyNoticeYn;
}