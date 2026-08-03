package com.example.demo.domain.community.constant;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Q&amp;A 채택 상태 코드 (공통코드 부모 1500).
 *
 * <p>
 * 지금까지 1501~1504 는 전부 매직넘버로 흩어져 있었다 ({@code AnswerService.adoptAnswer} 의
 * {@code 1502L}, {@code BoardMapper.xml} insert 의 하드코딩 {@code 1501} 등).
 * 시더가 상태를 배분하면서 <b>표시 이름</b>이 필요해져 {@link BoardTypeCode} 와 같은 방식으로
 * 한 곳에 모은다. 기존 호출부를 이 enum 으로 치환하는 것은 별개의 작업이다.
 * </p>
 *
 * <p>
 * <b>이 상태는 {@code TBL_BOARD_ANSWER_S.answer_is_adopted_yn} 과 이중 관리다.</b>
 * {@link #ADOPTED} 인 글은 채택된 답변이 정확히 1건이어야 하고, 나머지 상태는 0건이어야 한다.
 * DB 제약이 없으므로 이 불변식은 애플리케이션이 지켜야 한다.
 * </p>
 */
@Getter
@RequiredArgsConstructor
public enum BoardAdoptStatusCode {

	/** 진행중 — 신규 등록 기본값. {@code BoardMapper.xml} insert 가 하드코딩하는 값이다. */
	IN_PROGRESS(1501L, "진행중"),
	/** 채택완료 — 채택된 답변이 정확히 1건 있어야 한다. */
	ADOPTED(1502L, "채택완료"),
	/** 자체해결 — 질문자가 스스로 해결. 채택된 답변은 없다. */
	SELF_SOLVED(1503L, "자체해결"),
	/** 미해결 — 채택된 답변이 없다. */
	UNRESOLVED(1504L, "미해결");

	private final Long code;
	private final String label;

	/** 알 수 없는 코드는 진행중으로 본다 — 화면에 빈 칸을 내느니 기본 상태로 보이는 편이 낫다. */
	public static String labelOf(Long code) {
		return Arrays.stream(values())
				.filter(s -> s.code.equals(code))
				.findFirst()
				.orElse(IN_PROGRESS)
				.getLabel();
	}
}
