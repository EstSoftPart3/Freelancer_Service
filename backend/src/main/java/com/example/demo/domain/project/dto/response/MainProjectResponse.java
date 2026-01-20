package com.example.demo.domain.project.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class MainProjectResponse {
    private Long projectSq;
    private String projectTtl; // 제목
    private String companyNm; // 기업명
    private String projectAddress; // 지역 (예: 서울 중구)
    private String projectExperience; // 경력 (예: 고급)
    private Long projectSalary; // 단가 (숫자 데이터)
    private String formattedSalary; // 가공된 단가 (예: "월 900~1,100만원")
    private List<String> projectSkills; // 필수 기술 스택 리스트
}