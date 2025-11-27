package com.example.demo.domain.project.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularProjectDTO {
	
	private Long projectSq;
	private String projectTtl;
	private String projectImageUrl;
	private Long companySq;
	private String companyNm;
	private Long addressSq;
	private String address;
	private Long projectDeveloperGradeCd;
	private String devGradeNm;
	private Long projectRequiredEducationCd;
	private String requiredEduLv1;
	private LocalDate projectStartDt;
	private LocalDate projectEndDt;
	private LocalDate projectRecruitEndDt;
	private Integer projectViewCnt;
	private Boolean hasScrapped;
	private List<String> reqSkills;

}
