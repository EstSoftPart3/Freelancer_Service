package com.example.demo.domain.project.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.util.ProjectUtil;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProjectSummary {
	private Long projectSq;
	private String projectTtl;
	private String companyNm;
	private String companyImageUrl;
	private String address;
	private String descrption;
	private String preferContent;
	private String imageUrl;
	private String requiredEduLvl;
	private String devGradeNm;

	private Integer viewCnt;
	private Integer projectScrapCnt;
	private Integer applicantCnt;

	private LocalDate projectCreatedDt;
	private LocalDate recruitStartDt;
	private LocalDate recruitEndDt;

	private String recruitStatus;

	private Long salary;
	private List<String> reqSkills;

	private String hasScrapped;
	private String projectActivateYn;

	public static ProjectSummary from(Project project, ProjectUtil util, String address, String status,
			String hasScrapped, String companyImageUrl) {
		return ProjectSummary.builder()
				.projectSq(project.getProjectSq())
				.address(address)
				.projectTtl(project.getProjectTtl())
				.descrption(project.getProjectDescriptionTxt())
				.preferContent(project.getProjectPreferenceTxt())
				.imageUrl(project.getProjectImageUrl())
				.viewCnt(project.getProjectViewCnt())
				.projectScrapCnt(project.getProjectScrapCnt())
				.applicantCnt(project.getProjectCandidateCnt())
				.salary(project.getProjectSalary())
				.companyNm(util.convertCompanySqToName(project.getCompanySq()))
				.companyImageUrl(companyImageUrl)
				.projectCreatedDt(project.getProjectCreatedAtDtm().toLocalDate())
				.recruitStartDt(project.getProjectRecruitStartDt())
				.recruitEndDt(project.getProjectRecruitEndDt())
				.reqSkills(util.fetchReqSkillsByProjectSq(project.getProjectSq()))
				.devGradeNm(util.convertCommonCodeSqToNm(project.getProjectDeveloperGradeCd()))
				.requiredEduLvl(util.convertCommonCodeSqToNm(project.getProjectRequiredEducationCd()))
				.recruitStatus(status)
				.hasScrapped(hasScrapped)
				.projectActivateYn(project.getProjectActivateYn())
				.build();
	}
}
