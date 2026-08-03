package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 배분이 끝난 Q&amp;A 답변 한 건. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedPlanAnswerDTO {

	private String title;
	/** 변환된 HTML. 미리보기 화면이 이 값을 그대로 렌더하므로 변환기가 두 번 구현되지 않는다. */
	private String bodyHtml;
	private Long userSq;
	private String userNickname;
	private LocalDateTime createdAt;
	private Integer viewCnt;

	/**
	 * 채택 여부.
	 *
	 * <p>
	 * 한 Q&amp;A 안에서 이 값이 true 인 답변은 <b>0개 또는 정확히 1개</b>다.
	 * 원글의 {@code adoptStatusCd} 가 1502(채택완료) 일 때만 1개다.
	 * </p>
	 */
	private boolean adopted;

	private List<SeedPlanCommentDTO> comments;
}
