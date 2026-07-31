package com.example.demo.domain.admin.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Q&amp;A 답변 한 건의 콘텐츠. 작성자·작성일시·채택 여부는 서버가 정한다. */
@Getter
@Setter
@NoArgsConstructor
public class SeedAnswerDTO {

	/**
	 * 답변 제목.
	 *
	 * <p>
	 * <b>{@code TBL_BOARD_ANSWER_S.answer_ttl} 은 NOT NULL 이다.</b>
	 * {@code AnswerService.createAnswer} 도 제목이 없으면 예외를 던진다 — 화면상으로는
	 * 답변에 제목이 잘 안 보여서 스키마에서 빠뜨리기 쉬운 필드다.
	 * </p>
	 */
	@NotBlank(message = "답변 제목을 입력해주세요.")
	@Size(max = 100, message = "답변 제목은 100자 이하여야 합니다.")
	private String title;

	/** 구조화 텍스트(평문). 서버가 HTML 로 변환한다. */
	@NotBlank(message = "답변 내용을 입력해주세요.")
	private String body;

	/**
	 * 이 답변에 달릴 댓글 문구 후보. 실제로 몇 개가 달릴지는 옵션이 정한다.
	 * 댓글은 평문으로 저장된다({@code comment_description_txt}) — HTML 변환 대상이 아니다.
	 */
	private List<String> comments;
}
