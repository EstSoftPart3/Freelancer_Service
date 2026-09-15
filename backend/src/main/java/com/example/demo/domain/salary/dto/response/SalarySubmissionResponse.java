package com.example.demo.domain.salary.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 내 최근 제출 조회 — 프론트 SalaryCalculatorForm 진입 시 프리필용(localStorage 이력을 대체).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalarySubmissionResponse {
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
