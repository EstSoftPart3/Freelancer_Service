package com.example.demo.domain.notification.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.demo.domain.project.entity.Project;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class NotificationDTO {

	private Long notificationSq;
	
	private Long notificationTypeCd; 	// 알림 분류
	
	private Long notificationTargetTypeCd;	// 이동 대상 (게시글/댓글/프로젝트 등)
	private Long notificationTargetSq;
	
	private Long notificationTargetParentTypeCd;	// 여기는 댓글, 답변일때만 존재하므로 nullable
	private Long notificationTargetParentSq;
	
	private String notificationTtl;
	private String notificationTxt;
	
	private String notificationIsReadYn;
	private String notificationIsDeletedYn;
	
	private LocalDateTime notificationCreatedAtDtm;
	private LocalDateTime notificationDeletedAtDtm;
	
	private Long userSq;
	
	
	/**
	 * 
	 * COMMON_CODE    2200
	 * 
	 * 2201 "ANSWER"   답변
	 * 2202 "COMMENT"   댓글
	 * 2203 "INTERVIEW"  면접일 알림
	 * 2204 "PROJECT"  프로젝트 마감
	 * 2205 "SCRAP_COMPANY"   스크랩 신규 공고_회사(소속)
	 * 2206 "SCRAP_PROJECT"   스크랩 신규 공고_프로젝트
	 * 
	 */

}
