package com.example.demo.domain.admin.dto.request;

import java.util.List;

import com.example.demo.domain.admin.constant.SeedPostType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 시드 입력 한 건. 외부 AI 가 만들어 붙여넣는 <b>콘텐츠</b>만 담는다. */
@Getter
@Setter
@NoArgsConstructor
public class SeedPostDTO {

	@NotNull(message = "글 종류(BOARD/QNA)를 지정해주세요.")
	private SeedPostType type;

	/**
	 * AI 가 고른 카테고리(공통코드 3200 하위). {@code BOARD} 에서만 의미가 있다.
	 *
	 * <p>
	 * <b>힌트일 뿐이다</b> — {@code options.balanceCategories} 가 true 면 균등 배분에 밀려
	 * 다른 카테고리로 바뀔 수 있다.
	 * </p>
	 */
	private Long categoryHintCd;

	@NotBlank(message = "제목을 입력해주세요.")
	@Size(max = 100, message = "제목은 100자 이하여야 합니다.")
	private String title;

	/** 구조화 텍스트(평문). 서버가 HTML 로 변환한다. */
	@NotBlank(message = "내용을 입력해주세요.")
	private String body;

	/** 이 글에 달릴 댓글 문구 후보. 실제 개수는 옵션이 정한다. */
	private List<String> comments;

	/**
	 * 답변 후보. {@code QNA} 에서만 쓰인다.
	 *
	 * <p>
	 * 원소 검증을 걸려면 <b>필드에 {@code @Valid} 가 있어야 한다</b> — 없으면 리스트 안쪽
	 * {@code SeedAnswerDTO} 의 제약이 전혀 돌지 않는다.
	 * </p>
	 */
	@Valid
	private List<SeedAnswerDTO> answers;
}
