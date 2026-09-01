package com.example.demo.domain.project.dto.request;

import jakarta.validation.constraints.Min;

/**
 * 공고 한 건의 모집 인원 한 줄.
 *
 * <p>
 * 두 가지 모드를 같은 구조로 표현한다.
 * </p>
 * <ul>
 * <li><b>등급별 모집</b> — {@code grade} 가 채워진 행이 여러 개. "중상 2명, 상초 1명"</li>
 * <li><b>총원 모집</b> — {@code grade} 가 null 인 행 하나. "총 3명"</li>
 * </ul>
 *
 * <p>
 * {@code count} 가 null 이면 <b>인원 미정</b> 이다. 인원을 못 박지 않고 올리는 공고가 있어서
 * 숫자 상한(옛 999명)도 두지 않는다.
 * </p>
 *
 * <p>
 * 모드 플래그를 따로 두지 않는 이유가 이것이다. 저장 테이블
 * {@code TBL_PROJECT_RECRUIT_HEADCOUNT_S.developer_grade_cd} 의 NULL 여부가 곧 모드다.
 * </p>
 */
public record RecruitHeadcountRequest(

		/** 개발자 등급 이름(공통코드 700 하위). 총원 모드면 null */
		String grade,

		/** 모집 인원. null 이면 "인원 미정" — 값이 있을 때만 1명 이상인지 본다 */
		@Min(value = 1, message = "모집 인원은 1명 이상이어야 합니다.")
		Integer count) {
}
