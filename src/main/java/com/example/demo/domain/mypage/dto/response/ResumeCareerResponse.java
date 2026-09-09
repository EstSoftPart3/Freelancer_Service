package com.example.demo.domain.mypage.dto.response;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ResumeCareerResponse {
    private Long careerSq;                // 경력 순번(PK)
    private Long resumeSq;                // 이력서 순번(FK)
    private String careerCompanyNm;       // 회사명
    private String careerDepartmentNm;    // 부서
    private String careerPositionNm;      // 직급
    private LocalDate careerStartDt;      // 입사일자
    private LocalDate careerEndDt;        // 퇴사일자 (null)
}
