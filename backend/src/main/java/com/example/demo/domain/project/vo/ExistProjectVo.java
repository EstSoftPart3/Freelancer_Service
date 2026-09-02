package com.example.demo.domain.project.vo;

import java.util.List;
import java.util.Map;

import com.example.demo.domain.project.dto.response.AreaInfoResponse;
import com.example.demo.domain.project.dto.response.RecruitHeadcountResponse;
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

	/*
	 * 수정 폼 복원용 — 주소별 좌표·우편번호·시군구.
	 *
	 * 위의 latitude/longitude 는 목록·지도가 쓰는 대표 좌표라 두 주소를 합쳐 놓은 값이다.
	 * 폼은 상세주소와 지하철역을 각각 되살려야 하므로 나눠서 내려준다. 이게 없으면
	 * 수정 화면에서 지하철역 이름만 살아나고 좌표는 빈 채로 저장돼, 주소를 새로 INSERT 하는
	 * 경로에서 latitude NOT NULL 로 터진다.
	 */
	private Long detailedZonecode;
	private Double detailedLat;
	private Double detailedLon;
	private String detailedSigunguCode;
	private Double subwayLat;
	private Double subwayLon;
	private String subwaySigunguCode;

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
	/** 모집 인원. 비어 있으면 인원 개념이 없던 시절 공고다 */
	private List<RecruitHeadcountResponse> recruitHeadcounts;

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
				.detailedZonecode(p.getDetailedZonecode())
				.detailedLat(p.getDetailedLat())
				.detailedLon(p.getDetailedLon())
				// 프런트는 시군구 코드를 문자열로 다룬다(다음 우편번호 API 가 문자열로 준다).
				.detailedSigunguCode(p.getDetailedAreaCodeSq() == null ? null : String.valueOf(p.getDetailedAreaCodeSq()))
				.subwayLat(p.getSubwayLat())
				.subwayLon(p.getSubwayLon())
				.subwaySigunguCode(p.getSubwayAreaCodeSq() == null ? null : String.valueOf(p.getSubwayAreaCodeSq()))
				.addressTypeCd(p.getAddressTypeCd())
				.salaryNegotiableYn(p.getProjectSalaryNegotiableYn())

				.projectSalary(p.getProjectSalary())
				.description(p.getProjectDescriptionTxt())
				.recruitStartDt(p.getProjectRecruitStartDt().toString())
				.recruitEndDt(p.getProjectRecruitEndDt().toString())
				.projectStartDt(p.getProjectStartDt().toString())
				// 종료일은 "미정"(null)일 수 있다. 그대로 null 을 내보내면 수정 폼이 미정 상태로 복원된다.
				.projectEndDt(p.getProjectEndDt() == null ? null : p.getProjectEndDt().toString())
				.devGrade(util.convertCommonCodeSqToNm(p.getProjectDeveloperGradeCd()))
				.educationLvl(util.convertCommonCodeSqToNm(p.getProjectRequiredEducationCd()))
				.reqSkills(reqSkills)
				.preferSkills(preferSkills)
				.preferredEtc(p.getProjectPreferenceTxt())
				.jobs(util.fetchJobsByProjectSq(projectSq))
				.contract(util.fetchWorkTypesByProjectSq(projectSq))
				.interviewTimes(interviewTimes)
				.recruitHeadcounts(util.fetchRecruitHeadcountsByProjectSq(projectSq))
				.build();
	}
}