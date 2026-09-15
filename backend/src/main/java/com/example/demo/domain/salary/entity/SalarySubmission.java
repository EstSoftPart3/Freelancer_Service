package com.example.demo.domain.salary.entity;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SalarySubmission {
    private Long salarySubmissionSq;
    private Long userSq;
    private String isSeedYn;
    private String seedNickname;
    // TBL_USER_M 조인 전용 — insert 시에는 쓰지 않는다. 실제 제출은 이 값, 시드는 seedNickname 사용.
    private String userNickname;
    private String employmentType;
    private String jobNm;
    private String careerBucket;
    private String regionNm;
    private Integer annualSalary;
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
    private LocalDateTime createdAtDtm;
    private LocalDateTime updatedAtDtm;

    // insert/update 시 스킬 목록을 함께 실어보내는 용도 — 테이블 컬럼과는 별개(TBL_SALARY_SUBMISSION_SKILL_S).
    private List<String> skillTagNms;
}
