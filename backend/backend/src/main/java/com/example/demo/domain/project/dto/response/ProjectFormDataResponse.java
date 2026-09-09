package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.project.mapper.DistrictMapper;
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
			List<GroupSkillInfoResponse> skills
	) {
		return from(codeMapper, districtMapper, skills, null);
	}

	public static ProjectFormDataResponse from(
			CommonCodeMapper codeMapper,
			DistrictMapper districtMapper,
			List<GroupSkillInfoResponse> skills,
			ExistProjectVo existProjectVo
	) {
		return ProjectFormDataResponse.builder()
				.cities(districtMapper.findAllParentDistrict())
				.devGrades(codeMapper.findByParentCode(ParentCodeEnum.DEVELOPER_GRADE.getCode()))
				.educationLevels(codeMapper.findByParentCode(ParentCodeEnum.EDUCATION.getCode()))
				.workTypes(codeMapper.findByParentCode(ParentCodeEnum.CONTRACT_TYPE.getCode()))
				.recruitJobs(codeMapper.findByParentCode(ParentCodeEnum.JOB_POSITION.getCode()))
				.skills(skills)
				.existProjectVo(existProjectVo)
				.build();
	}
}
