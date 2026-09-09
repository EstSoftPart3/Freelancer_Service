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
	private String detailedAddress; // 상세 주소 (시/구 포함)
	private String detailedAddressDetail; // 상세 주소 (사용자 입력 상세)
	private String subwayAddress; // 지하철역 주소/명칭
	private Long addressTypeCd;
	private String imageUrl;
	private String requiredEduLvl;
	private String devGradeNm;

	private Integer viewCnt;
	private Integer applicantCnt;

	private LocalDate projectCreatedDt;
	private LocalDate recruitStartDt;
	private LocalDate recruitEndDt;

	private String recruitStatus;

	private Long salary;
	private String salaryNegotiableYn;
	private List<String> reqSkills;

	private String hasScrapped;

	// 추가된 필드들
	private String formattedSalary;
	private Double latitude;
	private Double longitude;
	private Double distance;

	// [수정] 파라미터에 String formattedSalary를 추가했습니다.
	public static ProjectSummary from(Project project, ProjectUtil util, String address, String status,
			String hasScrapped, String companyImageUrl, String formattedSalary) {
		return ProjectSummary.builder()
				.projectSq(project.getProjectSq())
				.detailedAddress(project.getDetailedAddress())
				.detailedAddressDetail(project.getDetailedAddressDetail())
				.subwayAddress(project.getSubwayAddress())
				.addressTypeCd(project.getAddressTypeCd())
				.projectTtl(project.getProjectTtl())
				.imageUrl(project.getProjectImageUrl())
				.viewCnt(project.getProjectViewCnt())
				.applicantCnt(project.getProjectCandidateCnt())
				.salary(project.getProjectSalary())
				.salaryNegotiableYn(project.getProjectSalaryNegotiableYn())
				.formattedSalary(formattedSalary)
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

				// 파라미터로 받은 가공된 급여 문자열 매핑
				.formattedSalary(formattedSalary)

				// Project 엔티티에 @Transient로 추가한 필드들 매핑
				.latitude(project.getLatitude())
				.longitude(project.getLongitude())
				.distance(project.getDistance())
				.build();
	}
}