package com.example.demo.domain.project.vo;

import java.util.List;
import java.util.Map;

import com.example.demo.domain.project.dto.response.AreaInfoResponse;
import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.util.ProjectUtil;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ExistProjectVo {
	private String projectTtl;
	private AreaInfoResponse parentDistrict;
	private AreaInfoResponse subDistrict;

	// [수정] 근무지 주소 문자열 추가
	private String detailedAddress; // 추가: "서울 강남구 테헤란로..."
	private String detailedAddressDetail; // 추가: "내용빌딩 3층"

	// [추가] 지하철 및 좌표 정보
	private String subwayAddress;
	private Double latitude;
	private Double longitude;
	private Long addressTypeCd; // 2701 혹은 2702

	private String devGrade;
	private String educationLvl;
	private Long projectSalary;
	private String salaryNegotiableYn; // [추가] 단가협의 여부

	private List<String> contract;
	private List<String> jobs;
	private List<String> reqSkills;
	private List<String> preferSkills;
	private String projectStartDt;
	private String projectEndDt;
	private String recruitStartDt;
	private String recruitEndDt;
	private Map<String, List<String>> interviewTimes;
	private String preferredEtc;
	private String description;

	public static ExistProjectVo from(Project p, ProjectUtil util, List<String> reqSkills,
			List<String> preferSkills, AreaInfoResponse parent, AreaInfoResponse sub) {
		Long projectSq = p.getProjectSq();
		Map<String, List<String>> interviewTimes = util.fetchAndConvertTimeSlots(projectSq);

		return ExistProjectVo.builder()
				.projectTtl(p.getProjectTtl())
				.parentDistrict(parent) // 상세 주소 없으면 null로 들어옴
				.subDistrict(sub) // 상세 주소 없으면 null로 들어옴

				// [추가] 엔티티에서 지하철 및 좌표 정보 매핑
				// [핵심] 엔티티에서 근무지 주소 문자열 매핑
				.detailedAddress(p.getDetailedAddress()) // 조인으로 채워지는 필드
				.detailedAddressDetail(p.getDetailedAddressDetail())
				.subwayAddress(p.getSubwayAddress())
				.latitude(p.getLatitude())
				.longitude(p.getLongitude())
				.addressTypeCd(p.getAddressTypeCd())
				.salaryNegotiableYn(p.getProjectSalaryNegotiableYn())

				.projectSalary(p.getProjectSalary())
				.description(p.getProjectDescriptionTxt())
				.recruitStartDt(p.getProjectRecruitStartDt().toString())
				.recruitEndDt(p.getProjectRecruitEndDt().toString())
				.projectStartDt(p.getProjectStartDt().toString())
				.projectEndDt(p.getProjectEndDt().toString())
				.devGrade(util.convertCommonCodeSqToNm(p.getProjectDeveloperGradeCd()))
				.educationLvl(util.convertCommonCodeSqToNm(p.getProjectRequiredEducationCd()))
				.reqSkills(reqSkills)
				.preferSkills(preferSkills)
				.preferredEtc(p.getProjectPreferenceTxt())
				.jobs(util.fetchJobsByProjectSq(projectSq))
				.contract(util.fetchWorkTypesByProjectSq(projectSq))
				.interviewTimes(interviewTimes)
				.build();
	}
}