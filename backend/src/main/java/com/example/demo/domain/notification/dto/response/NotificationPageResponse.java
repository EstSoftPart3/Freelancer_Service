package com.example.demo.domain.notification.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationPageResponse {
	private Long notificationSq;
	private Long notificationTypeCd;
	private String notificationTypeName;
	private String notificationTtl;
	private Boolean notificationIsReadYn;
	private LocalDateTime notificationCreatedAtDtm;
	private String timeago;
	private String targetUrl;
	
	private String boardTitle;
	private String projectTitle;
	private String commentContent;
	private String authorName;
	
}
