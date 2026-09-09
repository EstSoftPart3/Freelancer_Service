package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.domain.project.vo.ApplicationStatusVo;
import com.example.demo.domain.project.vo.ResumeNmTtlVo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationStatusResponse {
	private Long applicationSq;
	private ResumeNmTtlVo nameTitleVo;
	private int careerYear; 
	private List<String> skillNames;
	private ApplicationStatusVo appStatusVo;
	private String memberType;
	private String companyNm;
	
	public static ApplicationStatusResponse personal(Long appSq, ResumeNmTtlVo resumeNmTtlVo, int careerYear, List<String> skills,
			ApplicationStatusVo statusVo, String memberType) {
		return ApplicationStatusResponse.builder()
				.applicationSq(appSq)
				.nameTitleVo(resumeNmTtlVo)
				.careerYear(careerYear)
				.skillNames(skills)
				.appStatusVo(statusVo)
				.memberType(memberType)
				.build();
	}
	
	public static ApplicationStatusResponse company(Long appSq, ResumeNmTtlVo resumeNmTtlVo, int careerYear, List<String> skills,
			ApplicationStatusVo statusVo, String memberType, String companyNm) {
		return ApplicationStatusResponse.builder()
				.applicationSq(appSq)
				.nameTitleVo(resumeNmTtlVo)
				.careerYear(careerYear)
				.skillNames(skills)
				.appStatusVo(statusVo)
				.memberType(memberType)
				.companyNm(companyNm)
				.build();
	}
}
