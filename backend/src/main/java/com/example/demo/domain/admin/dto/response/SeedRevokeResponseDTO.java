package com.example.demo.domain.admin.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 시드 회수 결과(미리보기·실행 공용). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedRevokeResponseDTO {

	/** false 면 미리보기 — 아무것도 지우지 않았고 숫자는 "지워질 예정" 이다. */
	private boolean executed;

	/** 정밀 회수인지(게시글 번호 지정) 광역 회수인지. 화면 경고 문구를 가른다. */
	private boolean wide;

	private int boards;
	private int answers;
	private int comments;

	/**
	 * 댓글이 지워져 댓글 수를 다시 센 <b>살아남은</b> 글·답변의 수.
	 *
	 * <p>
	 * 봇이 실제 사용자의 글에 댓글을 달았다면 그 글은 회수 대상이 아니지만
	 * {@code board_comment_cnt} 는 반드시 다시 계산해야 한다. 빠뜨리면 실유저 게시글에
	 * <b>영구히 틀린 댓글 수</b>가 남는다.
	 * </p>
	 */
	private int recalculatedBoards;
	private int recalculatedAnswers;

	/** 회수 대상 상위 20건. 숫자만으로는 무엇이 지워지는지 알 수 없다. */
	private List<SeedRevokeSampleDTO> samples;
}
