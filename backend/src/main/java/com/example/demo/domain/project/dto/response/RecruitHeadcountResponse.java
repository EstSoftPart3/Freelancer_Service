package com.example.demo.domain.project.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * 공고의 모집 인원 한 줄. 상세 조회와 수정 폼 복원이 함께 쓴다.
 *
 * <p>
 * {@code grade} 가 null 이면 등급 구분 없는 총원이다.
 * </p>
 */
@Getter
@Setter
public class RecruitHeadcountResponse {
    /**
     * 행 PK.
     *
     * <p>
     * 화면에서 쓰지는 않지만 SELECT 에 반드시 포함해야 한다 — 총원 모드 + 인원 미정이면
     * grade 와 count 가 둘 다 NULL 이라, MyBatis 가 "모든 컬럼이 null 인 행" 을
     * 객체 대신 <b>null 로 매핑</b>해 리스트에 null 이 들어간다.
     * 항상 값이 있는 이 컬럼이 그걸 막는다.
     * </p>
     */
    private Long headcountSq;
    private String grade;
    /** null 이면 인원 미정 */
    private Integer count;
}
