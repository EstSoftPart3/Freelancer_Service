package com.example.demo.domain.notification.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
public class NotificationModalResponse {
	
	private Long notificationSq;
	private Long notificationTypeCd;
	private String notificationTypeName; // "게시글 댓글", "프로젝트 모집 마감" 등
	private Long notificationTargetTypeCd;
	private Long notificationTargetSq;
	private String notificationTtl;
	private String notificationTxt;
	private Boolean notificationIsReadYn;
	private LocalDateTime notificationCreatedAtDtm;
	private String timeAgo; // "방금 전", "1시간 전", "어제", "2일 전"
	private String targetUrl; // 클릭 시 이동할 URL
}
