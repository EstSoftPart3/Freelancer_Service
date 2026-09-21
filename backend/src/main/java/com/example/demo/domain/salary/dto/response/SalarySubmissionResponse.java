package com.example.demo.domain.salary.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 내 최근 제출 조회 — 프론트 SalaryCalculatorForm 진입 시 프리필용(localStorage 이력을 대체).
 *
 * <p>
 * BO 상세 조회({@code AdminSalaryService.getAdminSubmission})도 이 DTO를 그대로 재사용한다
 * (면접후기·투표 BO가 삭제여부 뱃지를 셰어드 DTO에 필드만 추가해 표시한 것과 동일한 패턴).
 * 아래 4개 필드는 FO의 {@code getMySubmission}에서는 채우지 않는다.
 * </p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalarySubmissionResponse {
    private Long salarySubmissionSq;
    private Long userSq;
    private String userNickname;
    private String isSeedYn;
    private String seedNickname;
    private String isDeletedYn;
    private LocalDateTime createdAtDtm;
    private String employmentType;
    private String jobNm;
    private String careerBucket;
    private String regionNm;
    private Integer annualSalary;
    private List<String> skillTagNms;
    private String ageBand;
    private String educationNm;
    private String companySize;
    private String companyType;
    private String positionNm;
    private String teamSize;
    private String employmentSubtype;
    private String remoteType;
    private Integer bonusAmount;
    private String stockOpt;
    private String jobChangeCount;
    private String companyNm;
    private Integer prevAnnualSalary;
    private String jobChangedYm;
}
