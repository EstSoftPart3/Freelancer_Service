package com.example.demo.domain.admin.dto.response;

import org.apache.ibatis.annotations.Mapper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProjectResponseDTO {
	private Long projectSq;         // project_sq (이동 및 식별용)
    private String projectTtl;    // project_ttl
//    private String companySq;  // company_sq를 이용해 조회한 기업명
    private String companyNm;
    private String projectSalary;   // project_salary 가공 (예: 9,000,000원)
    private String projectStartDt;   // start_dt ~ end_dt 가공
    private String projectEndDt;   // 상태 코드 혹은 날짜로 판별한 상태값
    private String projectStatus;  // erd 추가
}
