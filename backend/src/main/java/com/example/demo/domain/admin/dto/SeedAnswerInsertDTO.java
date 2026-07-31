package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 시드 Q&amp;A 답변 INSERT 파라미터. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedAnswerInsertDTO {

	/** INSERT 후 채워진다. 답변에 달리는 댓글의 FK 가 된다. */
	private Long answerSq;

	private Long boardSq;
	private Long userSq;
	private String answerTtl;
	private String answerDescriptionEdt;

	private Integer answerViewCnt;
	private Integer answerCommentCnt;

	/**
	 * 채택 여부 ('Y'/'N').
	 *
	 * <p>
	 * <b>원글의 {@code board_adopt_status_cd} 와 반드시 짝이 맞아야 한다.</b>
	 * 1502(채택완료)인 글은 이 값이 'Y' 인 답변이 정확히 1건, 나머지 상태는 0건이다.
	 * DB 제약이 없으므로 이 짝을 애플리케이션이 지킨다.
	 * </p>
	 */
	private String answerIsAdoptedYn;

	private LocalDateTime answerCreatedAtDtm;
}
