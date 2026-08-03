package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.domain.admin.constant.SeedPostType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 배분이 끝난 글 한 건. <b>미리보기 화면이 보는 것과 DB 에 들어가는 것이 이 객체 하나로 같아진다.</b>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedPlanRowDTO {

	/** 요청 배열에서의 위치. 경고 메시지가 이 번호로 원본을 가리킨다. */
	private int index;

	private SeedPostType type;
	/** 1401 일반게시판 / 1402 Q&amp;A. */
	private Long boardTypeCd;

	private String title;
	private String bodyHtml;

	private Long userSq;
	private String userNickname;
	private LocalDateTime createdAt;
	private Integer viewCnt;

	/** 일반게시판에만 값이 있다. Q&amp;A 는 {@code resolveCategoryCd} 규칙대로 null 이다. */
	private Long categoryCd;
	private String categoryNm;

	/** Q&amp;A 에만 값이 있다 (1501~1504). */
	private Long adoptStatusCd;
	private String adoptStatusNm;

	private List<SeedPlanAnswerDTO> answers;
	private List<SeedPlanCommentDTO> comments;
}
