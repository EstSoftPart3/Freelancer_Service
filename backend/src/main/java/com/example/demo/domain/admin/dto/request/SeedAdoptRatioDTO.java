package com.example.demo.domain.admin.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Q&amp;A 채택상태 분포 비율(%). 합계는 100 이어야 한다.
 *
 * <p>
 * 여기서 정한 {@code adopted} 비율이 그대로 반영되지 않을 수 있다 —
 * <b>답변이 0개인 Q&amp;A 는 채택완료가 될 수 없기 때문</b>이다.
 * 배분기가 부족분을 진행중으로 돌리고 경고를 남긴다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class SeedAdoptRatioDTO {

	/** 1501 진행중 */
	@NotNull(message = "진행중 비율을 입력해주세요.")
	@Min(value = 0, message = "진행중 비율은 0 이상이어야 합니다.")
	@Max(value = 100, message = "진행중 비율은 100 이하여야 합니다.")
	private Integer inProgress;

	/** 1502 채택완료 — 답변이 1개 이상인 글에만 배정된다. */
	@NotNull(message = "채택완료 비율을 입력해주세요.")
	@Min(value = 0, message = "채택완료 비율은 0 이상이어야 합니다.")
	@Max(value = 100, message = "채택완료 비율은 100 이하여야 합니다.")
	private Integer adopted;

	/** 1503 자체해결 */
	@NotNull(message = "자체해결 비율을 입력해주세요.")
	@Min(value = 0, message = "자체해결 비율은 0 이상이어야 합니다.")
	@Max(value = 100, message = "자체해결 비율은 100 이하여야 합니다.")
	private Integer selfSolved;

	/** 1504 미해결 */
	@NotNull(message = "미해결 비율을 입력해주세요.")
	@Min(value = 0, message = "미해결 비율은 0 이상이어야 합니다.")
	@Max(value = 100, message = "미해결 비율은 100 이하여야 합니다.")
	private Integer unresolved;

	/**
	 * 합이 100 인지 검사한다.
	 *
	 * <p>
	 * 필드가 null 이면 여기서는 통과시킨다 — null 은 각 필드의 {@code @NotNull} 이 이미
	 * 잡고 있고, 여기서 또 실패시키면 "합이 100 이어야 합니다" 라는 엉뚱한 메시지가
	 * 함께 나가 원인을 흐린다.
	 * </p>
	 */
	@AssertTrue(message = "채택상태 비율의 합은 100 이어야 합니다.")
	public boolean isSumHundred() {
		if (inProgress == null || adopted == null || selfSolved == null || unresolved == null) {
			return true;
		}
		return inProgress + adopted + selfSolved + unresolved == 100;
	}
}
