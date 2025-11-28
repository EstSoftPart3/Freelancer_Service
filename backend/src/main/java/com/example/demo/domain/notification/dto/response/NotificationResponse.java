package com.example.demo.domain.notification.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
public class NotificationResponse {
	
	private Long notificationSq;
	
	private Long notificationTypeCd; 	// 알림 분류 
	
	private Long notificationTargetTypeCd;	// 이동 대상 (게시글/댓글/프로젝트 등)
	private Long notificationTargetSq;
	
	private Long notificationTargetParentTypeCd;	// 여기는 댓글, 답변일때만 존재하므로 nullable
	private Long notificationTargetParentSq;
	
	private String notificationTtl;
	private String notificationTxt;
	
	private String notificationIsReadYn;
	
	private LocalDateTime notificationCreatedAtDtm;
	
}
