package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 시드 등록 결과. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedCommitResponseDTO {

	private int insertedBoards;
	private int insertedAnswers;
	private int insertedComments;

	/**
	 * 이번에 만들어진 게시글 번호.
	 *
	 * <p>
	 * <b>정밀 회수의 근거다.</b> 봇 계정 전체를 기준으로 회수하면 이전 회차까지 함께 내려가므로,
	 * "방금 넣은 것만" 되돌리려면 이 목록이 필요하다. BO 화면이 브라우저에 보관한다.
	 * </p>
	 */
	private List<Long> boardSqs;

	private LocalDateTime executedAt;

	/** 등록된 계획의 요약. 화면이 결과를 다시 보여줄 때 쓴다. */
	private SeedSummaryDTO summary;

	private List<String> warnings;
}
