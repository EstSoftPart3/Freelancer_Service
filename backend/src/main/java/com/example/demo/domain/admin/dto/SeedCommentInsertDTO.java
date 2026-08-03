package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 시드 댓글 INSERT 파라미터.
 *
 * <p>
 * 댓글은 PK 를 되받을 필요가 없어(대댓글을 만들지 않는다) 유일하게 {@code <foreach>} 배치로 넣는다.
 * 게시글·답변은 하위 행이 그 PK 를 참조하므로 건당 INSERT 다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedCommentInsertDTO {

	private Long userSq;

	/** 게시글 댓글이면 채우고 답변 댓글이면 null 이다. <b>둘 다 채우면 안 된다.</b> */
	private Long boardSq;
	/** 답변 댓글이면 채우고 게시글 댓글이면 null 이다. */
	private Long answerSq;

	/** 평문. FO 는 이 값을 그대로 텍스트로 렌더한다(HTML 아님). */
	private String commentDescriptionTxt;

	/** 1601 게시글 댓글 / 1602 답변 댓글. {@code CommentService} 와 같은 규칙으로 정한다. */
	private Long commentTypeCd;

	private LocalDateTime commentCreatedAtDtm;
}
