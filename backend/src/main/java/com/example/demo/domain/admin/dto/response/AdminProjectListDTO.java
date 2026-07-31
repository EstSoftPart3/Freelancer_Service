package com.example.demo.domain.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * BO 프로젝트 관리 목록 행.
 *
 * <p>
 * FO 의 {@code ProjectListResponse} 를 재사용하지 않는다 — 그쪽은 공개 응답이라 관리자에게만
 * 필요한 값(등록 계정, 삭제 여부, 지원자 수)을 실을 수 없고, 필드명이 바뀌면 여기 별칭과
 * 조용히 어긋나 값이 null 로 빠진다(Phase 2 에서 BO 가 FO 타입을 공유하지 않아 겪은 문제와 같다).
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProjectListDTO {

    private Long projectSq;
    private String projectTtl;

    // 등록 주체
    private Long companySq;
    private String companyNm;
    private Long userSq;
    private String userId;

    // 기간
    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;
    private LocalDate projectStartDt;
    private LocalDate projectEndDt;

    /**
     * 모집 상태 — 'RECRUITING'(모집중) / 'SCHEDULED'(모집예정) / 'CLOSED'(마감).
     * 저장된 컬럼이 아니라 NOW() 와 모집기간을 비교해 쿼리가 계산한다.
     * FO 목록의 판정({@code ProjectMapper.recruitingCondition})과 같은 기준을 쓴다.
     */
    private String recruitStatus;

    // 지표
    private Long projectSalary;
    private String salaryNegotiableYn;
    private Integer viewCnt;
    private Integer scrapCnt;
    /** 지원자 수. 프로젝트 관리에서 "지원 0건인 공고"를 골라내는 데 쓴다. */
    private Integer applicationCnt;

    private String isDeletedYn;
    private LocalDateTime createdAt;
}
