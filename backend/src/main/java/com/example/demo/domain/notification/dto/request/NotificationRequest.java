package com.example.demo.domain.notification.dto.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationRequest {
	private NotificationInfo notificationInfo;

	
	@Data
	public static class NotificationInfo{
		
		private Long notificationTypeCd;           // 알림 타입 (2200)
        private Long notificationTargetTypeCd;     // 알림 대상 타입 (댓글/공통 코드 2200)
        private Long notificationTargetSq;         // 이동할 알림 대상 순번 (댓글 sq)
        private Long notificationTargetParentTypeCd; // 게시글 타입 코드 (2200)
        private Long notificationTargetParentSq;   // 게시글 순번
        private String notificationTtl;            // 알림 제목
        private String notificationTxt;            // 알림 내용
        private String contents;                   // 댓글 내용 (미리보기용)
	
	}
	

}
