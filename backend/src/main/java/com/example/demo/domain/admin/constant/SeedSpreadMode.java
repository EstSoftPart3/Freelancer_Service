package com.example.demo.domain.admin.constant;

/**
 * 작성일시를 어느 구간에 흩뿌릴지.
 *
 * <p>
 * 처음 커뮤니티를 채울 때와 매일 조금씩 채울 때는 요구가 정반대다. 전자는 "예전부터 쌓여 온
 * 것처럼" 보여야 하고, 후자는 "오늘도 사람들이 글을 쓴 것처럼" 보여야 한다.
 * </p>
 */
public enum SeedSpreadMode {

	/**
	 * 과거 {@code spreadDays} 일 구간에 분산. 초기 대량 투입용 기본값이다.
	 *
	 * <p>
	 * <b>매일 운영에는 쓰면 안 된다</b> — 매일 돌려도 새 글이 과거로 흩어져 목록 상단이 갱신되지 않는다.
	 * </p>
	 */
	PAST,

	/**
	 * 오늘 하루(활동 시간대 ~ 현재 시각)에 분산. 매일 운영용이다.
	 *
	 * <p>
	 * {@code spreadDays} 와 {@code hotWindowRatio} 는 무시된다.
	 * </p>
	 */
	TODAY
}
