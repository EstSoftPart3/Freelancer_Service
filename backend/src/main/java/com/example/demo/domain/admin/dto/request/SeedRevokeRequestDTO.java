package com.example.demo.domain.admin.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 시드 회수 요청.
 *
 * <p>
 * <b>어떤 조합이든 봇 계정이 쓴 것만 지운다.</b> {@code boardSqs} 에 실제 사용자의 글 번호를
 * 넣어도 작성자 조건에서 걸러진다 — 운영 도구가 실유저 데이터를 지우는 사고를 원천 차단한다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class SeedRevokeRequestDTO {

	/**
	 * 정밀 회수 — 등록 응답이 준 게시글 번호 목록.
	 *
	 * <p>
	 * 지정하면 <b>그 글과 거기 딸린 답변·댓글만</b> 내린다. 이전 회차는 건드리지 않는다.
	 * 비우면 광역 회수가 되어 대상 계정이 쓴 <b>모든 글과 모든 댓글</b>(남의 글에 단 것 포함)이 내려간다.
	 * </p>
	 */
	private List<Long> boardSqs;

	/** 대상 계정. 비우면 봇 계정 전체({@code user_id} 가 {@code bot_} 로 시작)다. */
	private List<Long> userSqs;

	/** 작성일시 하한. 광역 회수에서 "오늘 넣은 것만" 처럼 범위를 좁힐 때 쓴다. */
	private LocalDateTime createdFrom;
	private LocalDateTime createdTo;
}
