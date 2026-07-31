package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 배분이 끝난 댓글 한 건. 이 값 그대로 INSERT 된다. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedPlanCommentDTO {

	private Long userSq;
	private String userNickname;
	/** 평문. {@code comment_description_txt} 는 HTML 이 아니고 FO 도 평문으로 렌더한다. */
	private String description;
	/** 항상 원글(또는 답변) 작성 시각보다 뒤, 현재 시각보다 앞이다. */
	private LocalDateTime createdAt;
}
