package com.example.demo.domain.admin.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 시드 메타데이터 배분 옵션.
 *
 * <p>
 * <b>이 기능의 핵심 분담은 "AI 는 콘텐츠만, 서버가 메타데이터를 배분한다" 이다.</b>
 * 200건의 카테고리 균등 분배·채택상태 비율·시간 분산을 외부 AI 에게 시키면 반드시 어긋난다.
 * 그래서 제목·본문·댓글 문구만 받고, 나머지는 전부 여기 옵션으로 서버가 정한다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class SeedOptionsDTO {

	/** 작성일시를 과거 며칠 구간에 흩뿌릴지. */
	@NotNull(message = "분산 기간을 입력해주세요.")
	@Min(value = 1, message = "분산 기간은 1일 이상이어야 합니다.")
	@Max(value = 730, message = "분산 기간은 730일 이하여야 합니다.")
	private Integer spreadDays;

	/**
	 * 시간대별 배치 비율 {@code [1일내, 7일내, 30일내, 그이전]}. 합이 0 이거나 null 이면 균등 분산한다.
	 *
	 * <p>
	 * <b>왜 필요한가</b> — 베스트글 위젯({@code BoardMapper.findBestBoards})은 1/7/30일 창으로
	 * 글을 고른다. 전부 먼 과거로 흩뿌리면 시드를 수백 건 넣고도 <b>인기글 위젯이 텅 빈다.</b>
	 * 최근 구간에 일부를 의도적으로 남겨야 한다.
	 * </p>
	 */
	private List<Integer> hotWindowRatio;

	/**
	 * 작성자로 쓸 계정. null 이면 서버가 봇 계정 풀({@code user_id LIKE 'bot\_%'})을 조회한다.
	 */
	private List<Long> authorUserSqs;

	@NotNull(message = "댓글 최소 개수를 입력해주세요.")
	@Min(value = 0, message = "댓글 최소 개수는 0 이상이어야 합니다.")
	@Max(value = 50, message = "댓글 최소 개수는 50 이하여야 합니다.")
	private Integer commentMin;

	@NotNull(message = "댓글 최대 개수를 입력해주세요.")
	@Min(value = 0, message = "댓글 최대 개수는 0 이상이어야 합니다.")
	@Max(value = 50, message = "댓글 최대 개수는 50 이하여야 합니다.")
	private Integer commentMax;

	/**
	 * Q&amp;A 한 건에 붙일 답변 개수 범위.
	 *
	 * <p>
	 * 실제 개수는 {@code min(AI 가 준 답변 수, 이 범위에서 뽑은 난수)} 다 — 없는 답변을
	 * 지어낼 수는 없기 때문이다. 그래서 AI 에게는 넉넉히 요청하고 여기서 줄이는 편이 좋다.
	 * </p>
	 */
	@NotNull(message = "답변 최소 개수를 입력해주세요.")
	@Min(value = 0, message = "답변 최소 개수는 0 이상이어야 합니다.")
	@Max(value = 20, message = "답변 최소 개수는 20 이하여야 합니다.")
	private Integer answerMin;

	@NotNull(message = "답변 최대 개수를 입력해주세요.")
	@Min(value = 0, message = "답변 최대 개수는 0 이상이어야 합니다.")
	@Max(value = 20, message = "답변 최대 개수는 20 이하여야 합니다.")
	private Integer answerMax;

	@NotNull(message = "조회수 최솟값을 입력해주세요.")
	@Min(value = 0, message = "조회수 최솟값은 0 이상이어야 합니다.")
	private Integer viewMin;

	@NotNull(message = "조회수 최댓값을 입력해주세요.")
	@Min(value = 0, message = "조회수 최댓값은 0 이상이어야 합니다.")
	@Max(value = 100000, message = "조회수 최댓값은 100000 이하여야 합니다.")
	private Integer viewMax;

	@NotNull(message = "채택상태 비율을 입력해주세요.")
	@Valid
	private SeedAdoptRatioDTO adoptRatio;

	/**
	 * true 면 AI 가 준 {@code categoryHintCd} 를 무시하고 활성 카테고리에 균등 배분한다.
	 * 기본값 true — 카테고리별 글 수를 고르게 맞추는 것이 이 기능의 목적 중 하나다.
	 */
	private Boolean balanceCategories;

	public boolean balanceCategoriesOrDefault() {
		return balanceCategories == null || balanceCategories;
	}

	@AssertTrue(message = "댓글 최소 개수는 최대 개수보다 클 수 없습니다.")
	public boolean isCommentRangeValid() {
		return commentMin == null || commentMax == null || commentMin <= commentMax;
	}

	@AssertTrue(message = "답변 최소 개수는 최대 개수보다 클 수 없습니다.")
	public boolean isAnswerRangeValid() {
		return answerMin == null || answerMax == null || answerMin <= answerMax;
	}

	@AssertTrue(message = "조회수 최솟값은 최댓값보다 클 수 없습니다.")
	public boolean isViewRangeValid() {
		return viewMin == null || viewMax == null || viewMin <= viewMax;
	}

	@AssertTrue(message = "시간대별 배치 비율은 4개(1일내·7일내·30일내·그이전) 여야 합니다.")
	public boolean isHotWindowRatioValid() {
		if (hotWindowRatio == null || hotWindowRatio.isEmpty()) {
			return true;
		}
		return hotWindowRatio.size() == 4 && hotWindowRatio.stream().allMatch(v -> v != null && v >= 0);
	}
}
