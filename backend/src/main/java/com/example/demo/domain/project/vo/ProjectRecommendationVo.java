package com.example.demo.domain.project.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProjectRecommendationVo {

    // 출력용
    private Long projectSq;
    private String projectTtl;
    private String companyNm;
    private String addressNm;
    private Long projectSalary;

    // 계산 전용 (화면 출력 안 됨)
    private Long projectDeveloperGradeCd;
    private Long projectRequiredEducationCd;
    private String projectPreferenceTxt;
    
}
