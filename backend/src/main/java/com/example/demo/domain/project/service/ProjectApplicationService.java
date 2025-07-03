package com.example.demo.domain.project.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.company.mapper.CompanyMapper;
import com.example.demo.domain.mypage.mapper.ResumeCareerMapper;
import com.example.demo.domain.mypage.mapper.ResumeMapper;
import com.example.demo.domain.mypage.mapper.ResumeSkillMapper;
import com.example.demo.domain.project.dto.ApplicationGroupInfo;
import com.example.demo.domain.project.dto.request.ApplicationSqRequest;
import com.example.demo.domain.project.dto.request.ApplicationStatusRequest;
import com.example.demo.domain.project.dto.response.ApplicationStatusList;
import com.example.demo.domain.project.dto.response.ApplicationStatusResponse;
import com.example.demo.domain.project.dto.response.PagedResponse;
import com.example.demo.domain.project.mapper.ProjectApplicationMapper;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.vo.ApplicationStatusVo;
import com.example.demo.domain.project.vo.ApplicationSummary;
import com.example.demo.domain.project.vo.ResumeNmTtlVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectApplicationService {
	private final ProjectMapper projectMapper;
	private final ProjectApplicationMapper applicationMapper;
	private final CommonCodeMapper commonCodeMapper;
	private final ResumeMapper resumeMapper;
	private final ResumeCareerMapper resumeCareerMapper;
	private final ResumeSkillMapper resumeSkillMapper;
	private final CompanyMapper companyMapper;

	@Transactional
	public Map<String, Object> fetchProjectApplicationsWithCount(Long userSq, int offset, int size, String searchType,
			String keyword, String readType) {
		List<ApplicationSummary> list = applicationMapper.findApplicationSummariesByUserSqWithFilter(userSq, offset,
				size, searchType, keyword, readType);
		int totalCount = applicationMapper.countApplicationSummariesByUserSqWithFilter(userSq, searchType, keyword,
				readType);

		// 읽음/안읽음/전체 카운트
		List<Map<String, Object>> countsList = applicationMapper.countApplicationsByReadStatus(userSq);
		Map<String, Integer> countsMap = new HashMap<>();
		countsMap.put("all", 0);
		countsMap.put("read", 0);
		countsMap.put("unread", 0);
		for (Map<String, Object> m : countsList) {
			countsMap.put((String) m.get("type"), ((Number) m.get("cnt")).intValue());
		}

		Map<String, Object> result = new HashMap<>();
		result.put("applications", list);
		result.put("totalCount", totalCount);
		result.put("counts", countsMap);

		return result;
	}

	public void updateApplicantResult(ApplicationStatusRequest request, Long applicationSq) {
		Long statusCd = commonCodeMapper.findCommonCodeSqByName(request.getStatus(),
				ParentCodeEnum.PRO_APPLICATION.getCode());
		applicationMapper.updateApplicationStatus(statusCd, applicationSq);

		if (statusCd.equals(806L)) {
			Long projectSq = applicationMapper.findProjectBySq(applicationSq);
			projectMapper.decreaseApplication(projectSq);
		}
	}

	public void updateInterviewTimeSelected(Long interviewTimeSq, ApplicationSqRequest request) {
		applicationMapper.updateInterviewTimeSelected(interviewTimeSq);
		applicationMapper.updateApplicationInterviewTimeAndStatus(request.getApplicationSq(),
				applicationMapper.findInterviewTimeBySq(interviewTimeSq));
	}

	// public List<ApplicationStatusList> fetchProjectApplicationsByProject(Long
	// projectSq) {
	// List<Long> applicationSqs =
	// applicationMapper.findAllSqByProjectSq(projectSq);
	// List<ApplicationStatusResponse> responses = new ArrayList<>();
	// applicationSqs.forEach(
	// s -> {
	// Long resumeSq = applicationMapper.findResumeBySq(s);
	// Long appCompanySq = applicationMapper.findCompanyBySq(s);
	// String memberType = applicationMapper.findMmTypStrBySq(s);
	// ApplicationStatusVo applicationStatusVo =
	// applicationMapper.findStatusVoByAppSq(s);
	// List<String> skills = resumeSkillMapper.findAllNmBySq(resumeSq);
	// ResumeNmTtlVo resumeNmTtlVo = resumeMapper.findResumeNmTtlBySq(resumeSq);
	// int careerYear = resumeCareerMapper.calculateCareerByResSq(resumeSq);
	// if (memberType.equals("기업")) {
	// String companyNm = companyMapper.findCompanyNmByCompanySq(appCompanySq);
	// responses.add(ApplicationStatusResponse.company(s, resumeNmTtlVo, careerYear,
	// skills,
	// applicationStatusVo, memberType, companyNm));
	// } else {
	// responses.add(ApplicationStatusResponse.personal(s, resumeNmTtlVo,
	// careerYear, skills,
	// applicationStatusVo, memberType));
	// }
	// });

	// return groupByMemberType(responses);

	// }

	// public List<ApplicationStatusList>
	// groupByMemberType(List<ApplicationStatusResponse> responses) {
	// return responses.stream()
	// .collect(Collectors.groupingBy(
	// ApplicationStatusResponse::getMemberType))
	// .entrySet()
	// .stream()
	// .map(entry -> {
	// ApplicationStatusList grouped = new ApplicationStatusList();
	// grouped.setApplicantType(entry.getKey());
	// grouped.setResponse(entry.getValue());
	// return grouped;
	// })
	// .collect(Collectors.toList());
	// }

	public PagedResponse<ApplicationStatusList> fetchApplicationsGroupedByCompany(Long projectSq, int page, int size,
			String status) {
		int offset = (page - 1) * size;

		// 1. 그룹 리스트 및 총 개수 조회
		List<ApplicationGroupInfo> groups = applicationMapper.findApplicationGroupsByProjectSq(projectSq, status, size,
				offset);
		int totalGroups = applicationMapper.countApplicationGroupsByProjectSq(projectSq, status);

		if (groups.isEmpty()) {
			return new PagedResponse<>(List.of(), page, 0, 0);
		}

		// 2. 그룹 키(기업번호) 리스트 생성
		List<Long> groupCompanySqs = groups.stream()
				.map(ApplicationGroupInfo::getGroupCompanySq)
				.collect(Collectors.toList());

		// 3. 그룹별 지원자 전체 조회
		List<ApplicationStatusResponse> rawApplications = applicationMapper
				.findApplicationsByProjectSqAndGroupCompanies(projectSq, groupCompanySqs, status);

		// 4. 보강
		List<ApplicationStatusResponse> enrichedApps = rawApplications.stream().map(app -> {
			Long appSq = app.getApplicationSq();
			Long resumeSq = applicationMapper.findResumeBySq(appSq);
			ResumeNmTtlVo vo = resumeMapper.findResumeNmTtlBySq(resumeSq);
			int career = resumeCareerMapper.calculateCareerByResSq(resumeSq);
			List<String> skills = resumeSkillMapper.findAllNmBySq(resumeSq);
			ApplicationStatusVo statusVo = applicationMapper.findStatusVoByAppSq(appSq);
			String memberType = applicationMapper.findMmTypStrBySq(appSq);
			String companyNm = app.getCompanySq() != null ? companyMapper.findCompanyNmByCompanySq(app.getCompanySq())
					: null;

			return ApplicationStatusResponse.builder()
					.applicationSq(appSq)
					.nameTitleVo(vo)
					.careerYear(career)
					.skillNames(skills)
					.appStatusVo(statusVo)
					.memberType(memberType)
					.companyNm(companyNm)
					.companySq(app.getCompanySq())
					.build();
		}).collect(Collectors.toList());

		// 5. 지원자들을 기업 단위로 그룹핑
		Map<Long, List<ApplicationStatusResponse>> groupedMap = enrichedApps.stream()
				.collect(Collectors.groupingBy(app -> app.getCompanySq() == null ? -1L : app.getCompanySq()));

		List<ApplicationStatusList> resultList = groupedMap.entrySet().stream()
				.map(entry -> {
					ApplicationStatusList list = new ApplicationStatusList();
					list.setApplicantType(entry.getKey() == -1L ? "개인" : "기업");
					list.setResponse(entry.getValue());
					return list;
				})
				.collect(Collectors.toList());

		// 6. 전체 페이지 계산
		int totalPages = (int) Math.ceil((double) totalGroups / size);

		return new PagedResponse<>(resultList, page, totalPages, totalGroups);
	}

}
