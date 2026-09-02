package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.project.mapper.DistrictMapper;
import com.example.demo.domain.project.util.DeveloperGradeSupport;
import com.example.demo.domain.project.vo.ExistProjectVo;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProjectFormDataResponse {
	private List<AreaInfoResponse> cities; 
	private List<String> devGrades;
	private List<String> educationLevels;
	private List<String> workTypes;
	private List<String> recruitJobs;
	private List<GroupSkillInfoResponse> skills;
	private ExistProjectVo existProjectVo;
	
	public static ProjectFormDataResponse from(
			CommonCodeMapper codeMapper,
			DistrictMapper districtMapper,
			List<GroupSkillInfoResponse> skills,
			DeveloperGradeSupport gradeSupport
	) {
		return from(codeMapper, districtMapper, skills, null, gradeSupport);
	}

	public static ProjectFormDataResponse from(
			CommonCodeMapper codeMapper,
			DistrictMapper districtMapper,
			List<GroupSkillInfoResponse> skills,
			ExistProjectVo existProjectVo,
			DeveloperGradeSupport gradeSupport
	) {
		return ProjectFormDataResponse.builder()
				.cities(districtMapper.findAllParentDistrict())
				// 등급은 코드값 순이 아니라 서열 순으로 내려준다 — 코드값 순이면 나중에 추가된
				// 대분류(초급·중급·상급)가 목록 맨 뒤로 밀린다.
				.devGrades(gradeSupport.sortedGradeNames())
				.educationLevels(codeMapper.findByParentCode(ParentCodeEnum.EDUCATION.getCode()))
				.workTypes(codeMapper.findByParentCode(ParentCodeEnum.CONTRACT_TYPE.getCode()))
				.recruitJobs(codeMapper.findByParentCode(ParentCodeEnum.JOB_POSITION.getCode()))
				.skills(skills)
				.existProjectVo(existProjectVo)
				.build();
	}
}
