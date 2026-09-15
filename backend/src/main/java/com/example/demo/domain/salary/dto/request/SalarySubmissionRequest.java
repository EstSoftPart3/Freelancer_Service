package com.example.demo.domain.salary.dto.request;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SalarySubmissionRequest {
    private Long userSq;
    private String employmentType;
    private String jobNm;
    private String careerBucket;
    private String regionNm;
    private Integer annualSalary;
    private List<String> skillTagNms;

    // 선택 입력 — 프론트 SalaryCalculatorForm "더 정확한 분석" 11종
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

    // 신규 3종 — 회사 추천·이직 동향 실데이터화
    private String companyNm;
    private Integer prevAnnualSalary;
    private String jobChangedYm;
}
