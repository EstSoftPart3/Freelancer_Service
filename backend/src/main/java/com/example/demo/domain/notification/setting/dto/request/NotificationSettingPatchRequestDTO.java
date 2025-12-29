package com.example.demo.domain.notification.setting.dto.request;


import lombok.Data;

@Data
public class NotificationSettingPatchRequestDTO {
    private String allNoticeYn;          
    private String recruitNoticeYn;      
    private String commentNoticeYn;      
    private String scrapCompanyNoticeYn; 
}