package com.example.demo.domain.notification.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationTypeCode {
	
	ANSWER(2201L, "작성하신 게시글에 답변이 달렸습니다."),
	COMMENT(2202L, "작성하신 게시글에 댓글이 달렸습니다."),
	INTERVIEW(2203L, "면접 일정 알림"),
	PROJECT(2204L, "프로젝트 모집 마감 알림"),
	SCRAP_COMPANY(2205L, "스크랩 신규 알림"),
	SCRAP_PROJECT(2206L, "스크랩 신규 알림"),
	APPLICATION_RESULT(2207L, "지원 결과 안내"),
	BOARD(2208L, "");

	private final Long code;
	private final String title;
}
