package com.example.demo.domain.salary.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** BO 연봉 제출건 목록 행. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryListItemDTO {
    private Long salarySubmissionSq;
    private Long userSq;
    private String userNickname;
    private String isSeedYn;
    private String seedNickname;
    private String employmentType;
    private String jobNm;
    private String careerBucket;
    private String regionNm;
    private Integer annualSalary;
    private String companyNm;
    private String isDeletedYn;
    private LocalDateTime createdAtDtm;
}
