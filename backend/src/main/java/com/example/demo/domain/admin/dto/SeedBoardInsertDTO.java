package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 시드 게시글 INSERT 파라미터.
 *
 * <p>
 * {@code BoardMapper.insert} 를 못 쓰는 이유가 이 필드 목록에 그대로 드러난다 —
 * 그쪽 INSERT 에는 {@code board_created_at_dtm} 과 {@code board_view_cnt} 가 아예 없고
 * {@code board_adopt_status_cd} 는 1501 로 하드코딩돼 있다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedBoardInsertDTO {

	/** INSERT 후 MyBatis 가 채워 넣는다({@code useGeneratedKeys}). 답변·댓글의 FK 가 된다. */
	private Long boardSq;

	private Long userSq;
	private String boardTtl;
	private String boardDescriptionEdt;

	/** 1401 일반게시판 / 1402 Q&amp;A. */
	private Long boardTypeCd;
	/** {@code BoardTypeCode.typOf} 가 만드는 문자열. 같은 정보를 두 컬럼에 중복 보관하는 기존 구조를 따른다. */
	private String boardTyp;

	private Long boardCategoryCd;
	private Long boardAdoptStatusCd;

	private Integer boardViewCnt;

	/**
	 * 이 글에 함께 넣는 댓글 수.
	 *
	 * <p>
	 * {@code updateCommentCnt} 로 재집계하지 않고 INSERT 에서 바로 넣는다 — 새로 만드는 글이라
	 * 정확한 값을 이미 알고 있고, 50건이면 재집계 호출만으로 <b>왕복이 50회 늘어난다</b>(원격 DB다).
	 * </p>
	 */
	private Integer boardCommentCnt;

	private LocalDateTime boardCreatedAtDtm;
}
