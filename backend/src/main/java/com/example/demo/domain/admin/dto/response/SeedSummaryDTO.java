package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 배분 결과 요약. 등록 전에 "이대로 넣어도 되는지" 판단하는 화면의 근거다. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedSummaryDTO {

	private int totalBoards;
	private int totalQna;
	private int totalAnswers;
	private int totalComments;

	/** 일반게시판 카테고리 분포. 균등 배분이 실제로 균등한지 여기서 확인한다. */
	private List<SeedCountDTO> countByCategory;
	/** Q&amp;A 채택상태 분포. 요청한 비율과 어긋나면 경고가 함께 나간다. */
	private List<SeedCountDTO> countByAdoptStatus;
	/** 계정별 분포. 특정 닉네임 도배를 잡아내는 표. */
	private List<SeedAuthorStatDTO> countByAuthor;

	private LocalDateTime createdAtMin;
	private LocalDateTime createdAtMax;
}
