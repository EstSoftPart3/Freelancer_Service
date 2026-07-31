package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 배분 계획. 미리보기 응답이자 등록의 실행 대상이다.
 *
 * <p>
 * 미리보기와 등록이 <b>같은 {@code SeedPlanner.plan()}</b> 을 부르고, 등록은 여기에 담긴 값을
 * 그대로 INSERT 한다. 그래서 "화면에서 본 것과 다른 게 들어가는" 일이 구조적으로 없다 —
 * 단, 두 호출이 <b>같은 {@code randomSeed}</b> 를 써야 성립한다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedPlanResponseDTO {

	/** 이 계획을 만든 시드. 등록 요청에 그대로 실어 보내야 같은 결과가 나온다. */
	private Long randomSeed;

	/**
	 * 이 계획의 배분 기준 시각. <b>{@code randomSeed} 와 함께 등록 요청에 실어야 한다</b> —
	 * 둘 중 하나만 같으면 재현되지 않는다.
	 */
	private LocalDateTime plannedAt;

	private SeedSummaryDTO summary;
	private List<SeedPlanRowDTO> rows;

	/**
	 * 사람이 읽어야 할 경고. 요청을 거절하지는 않지만 결과가 요청과 다를 때 남는다.
	 * (예: 답변 0개라 채택완료를 못 준 건, 계정 부족으로 댓글 수가 깎인 건, 변환 후 빈 본문)
	 */
	private List<String> warnings;
}
