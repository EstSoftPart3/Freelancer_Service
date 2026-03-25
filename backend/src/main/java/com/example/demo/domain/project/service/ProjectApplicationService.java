package com.example.demo.domain.project.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import com.example.demo.domain.project.dto.CorporateApplicantGroupDTO;
import com.example.demo.domain.project.dto.PersonalApplicantDTO;
import com.example.demo.domain.project.dto.request.ApplicationSqRequest;
import com.example.demo.domain.project.dto.request.ApplicationStatusRequest;
import com.example.demo.domain.project.dto.response.ApplicationStatusList;
import com.example.demo.domain.project.dto.response.ApplicationStatusResponse;
import com.example.demo.domain.project.dto.response.PagedApplicantResponseDTO;
import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.mapper.ProjectApplicationMapper;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.vo.ApplicationStatusVo;
import com.example.demo.domain.project.vo.ApplicationSummary;
import com.example.demo.domain.project.vo.ResumeNmTtlVo;
import com.example.demo.domain.user.service.NotificationService;

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
	private final NotificationService notificationService;

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

	@Transactional
	public Map<String, Object> fetchCorporateProjectApplicationsWithCount(Long userSq, int offset, int size,
			String searchType, String keyword, String readType) {
		Long companySq = companyMapper.findCompanySqByUserSq(userSq);

		Map<String, Object> params = new HashMap<>();
		params.put("companySq", companySq);
		params.put("offset", offset);
		params.put("size", size);
		params.put("searchType", searchType);
		params.put("keyword", keyword);
		params.put("readType", readType);

		List<Map<String, Object>> list = applicationMapper.findCorporateApplications(params);
		int totalCount = applicationMapper.countCorporateApplications(params);

		// 읽음/안읽음/전체 카운트
		List<Map<String, Object>> countsList = applicationMapper.countCorporateApplicationsByReadStatus(companySq);
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

	@Transactional
	public void updateApplicantResult(ApplicationStatusRequest request, Long applicationSq) {
		Long statusCd = commonCodeMapper.findCommonCodeSqByName(request.getStatus(),
				ParentCodeEnum.PRO_APPLICATION.getCode());

		applicationMapper.updateApplicationStatus(statusCd, applicationSq);

		if (statusCd.equals(806L)) {
			Long projectSq = applicationMapper.findProjectBySq(applicationSq);
			projectMapper.decreaseApplication(projectSq);
		}
		// ================= [ 알림 발송 로직 ] =================

		// 시나리오 1 & 2: 회사가 지원 상태 변경 (지원자에게 알림)
		if (statusCd.equals(802L) || statusCd.equals(804L)) {
			Map<String, Object> info = applicationMapper.findApplicationNotificationInfo(applicationSq);
			if (info != null) {
				Long receiverSq = (Long) info.get("userSq");
				String projectTtl = (String) info.get("projectTtl");
				String message = "";

				if (statusCd.equals(802L)) { // 불합격
					message = "[" + projectTtl + "] 프로젝트의 지원 결과가 발표되었습니다. (불합격)";
				} else if (statusCd.equals(804L)) { // 합격 (인터뷰 등)
					message = "축하합니다! [" + projectTtl + "] 프로젝트에 합격(인터뷰 요청)하셨습니다.";
				}

				notificationService.send(receiverSq, null, 2602L, message, "/mypage/appliedProjects");

				// 기업 지원(302)인 경우 소속 기업회원에게도 알림 발송
				Long memberTypeCd = (Long) info.get("memberTypeCd");
				if (memberTypeCd != null && memberTypeCd.equals(302L)) {
					Long appCompanyUserSq = (Long) info.get("appCompanyUserSq");
					if (appCompanyUserSq != null) {
						notificationService.send(appCompanyUserSq, null, 2602L, message, "/mypage/appliedProjects");
					}
				}
			}
		}

		// 시나리오 3: 지원자가 지원을 취소함 (회사 담당자에게 알림)
		else if (statusCd.equals(806L)) {
			Map<String, Object> cancelInfo = applicationMapper.findCancelNotificationInfo(applicationSq);
			if (cancelInfo != null) {
				Long companyUserSq = (Long) cancelInfo.get("companyUserSq");
				String applicantNm = (String) cancelInfo.get("applicantNm");
				String projectTtl = (String) cancelInfo.get("projectTtl");
				Long projectSq = (Long) cancelInfo.get("projectSq");
				Long typeCd = (Long) cancelInfo.get("memberTypeCd");

				// 타입 코드에 따른 모달 파라미터 매핑 (301: personal, 302: corporate)
				String appTyp = (typeCd != null && typeCd.equals(302L)) ? "corporate" : "personal";

				String message = "[" + projectTtl + "] 프로젝트의 지원자(" + applicantNm + "님)가 지원을 취소했습니다.";
				String targetUrl = "/mypage/affiliationProjectList?projectSq=" + projectSq + "&appTyp=" + appTyp;

				notificationService.send(companyUserSq, null, 2602L, message, targetUrl);
			}
		}
	}

	@Transactional
	public void updateInterviewTimeSelected(Long interviewTimeSq, ApplicationSqRequest request, Long userTypeCd) {
		// 개인회원(301)은 모집 기간 만료 후 인터뷰 시간 선택 불가
		if (userTypeCd.equals(301L)) {
			Long projectSq = applicationMapper.findProjectBySq(request.getApplicationSq());
			Project project = projectMapper.findBySq(projectSq);
			if (project.getProjectRecruitEndDt().isBefore(LocalDate.now())) {
				throw new IllegalArgumentException("모집 기간이 종료된 프로젝트입니다.");
			}
		}

		applicationMapper.updateInterviewTimeSelected(interviewTimeSq);
		applicationMapper.updateApplicationInterviewTimeAndStatus(request.getApplicationSq(),
				applicationMapper.findInterviewTimeBySq(interviewTimeSq));

		// ================= [ 알림 발송 ] =================

		// 2. 알림에 필요한 정보 조회
		Map<String, Object> info = applicationMapper.findInterviewConfirmationInfo(
				request.getApplicationSq(), interviewTimeSq);

		if (info != null) {
			Long companyUserSq = (Long) info.get("companyUserSq");
			Long applicantUserSq = (Long) info.get("applicantUserSq");
			String applicantNm = (String) info.get("applicantNm");
			String projectTtl = (String) info.get("projectTtl");
			Long projectSq = (Long) info.get("projectSq");
			Long typeCd = (Long) info.get("memberTypeCd");

			// [오류 해결] java.sql.Timestamp 형변환 처리
			Object dtmObj = info.get("interviewDtm");
			LocalDateTime dtm = null;

			if (dtmObj instanceof Timestamp) {
				dtm = ((Timestamp) dtmObj).toLocalDateTime();
			} else if (dtmObj instanceof LocalDateTime) {
				dtm = (LocalDateTime) dtmObj;
			}

			if (dtm != null) {
				// 날짜 포맷팅
				String formattedDate = dtm.format(DateTimeFormatter.ofPattern("M월 d일 H시 m분"));

				// 지원 유형 매핑 (301: personal, 302: corporate)
				String appTyp = (typeCd != null && typeCd.equals(302L)) ? "corporate" : "personal";
				String companyTargetUrl = "/mypage/affiliationProjectList?projectSq=" + projectSq + "&appTyp=" + appTyp;

				//	프로젝트 담당회사에게 항상 알림
				String applicantMessage = String.format("[%s] 프로젝트의 인터뷰 시간이 확정되었습니다. (일시: %s)",
						projectTtl, formattedDate);
				notificationService.send(companyUserSq, null, 2602L, applicantMessage, companyTargetUrl);

				// 기업 지원(302)인 경우 개인에게도 알림
				if (typeCd != null && typeCd.equals(302L)) {
					notificationService.send(applicantUserSq, null, 2602L, applicantMessage, "/mypage/appliedProjects");
				}
			}
		}
	}

	@Transactional
	public List<ApplicationStatusList> fetchProjectApplicationsByProject(Long projectSq) {
		List<Long> applicationSqs = applicationMapper.findAllSqByProjectSq(projectSq);
		List<ApplicationStatusResponse> responses = new ArrayList<>();
		applicationSqs.forEach(
				s -> {
					Long resumeSq = applicationMapper.findResumeBySq(s);
					Long appCompanySq = applicationMapper.findCompanyBySq(s);
					String memberType = applicationMapper.findMmTypStrBySq(s);
					ApplicationStatusVo applicationStatusVo = applicationMapper.findStatusVoByAppSq(s);
					List<String> skills = resumeSkillMapper.findAllNmBySq(resumeSq);
					ResumeNmTtlVo resumeNmTtlVo = resumeMapper.findResumeNmTtlBySq(resumeSq);
					int careerYear = resumeCareerMapper.calculateCareerByResSq(resumeSq);
					if (memberType.equals("기업")) {
						String companyNm = companyMapper.findCompanyNmByCompanySq(appCompanySq);
						responses.add(ApplicationStatusResponse.company(s, resumeNmTtlVo, careerYear, skills,
								applicationStatusVo, memberType, companyNm));
					} else {
						responses.add(ApplicationStatusResponse.personal(s, resumeNmTtlVo, careerYear, skills,
								applicationStatusVo, memberType));
					}
				});

		return groupByMemberType(responses);

	}

	@Transactional
	public List<ApplicationStatusList> groupByMemberType(List<ApplicationStatusResponse> responses) {
		return responses.stream()
				.collect(Collectors.groupingBy(
						ApplicationStatusResponse::getMemberType))
				.entrySet()
				.stream()
				.map(entry -> {
					ApplicationStatusList grouped = new ApplicationStatusList();
					grouped.setApplicantType(entry.getKey());
					grouped.setResponse(entry.getValue());
					return grouped;
				})
				.collect(Collectors.toList());
	}

	@Transactional
	public PagedApplicantResponseDTO<PersonalApplicantDTO> getPersonalApplicants(
			Long projectSq, int page, int size, String filter, String searchType, String keyword) {

		int offset = (page - 1) * size;
		List<PersonalApplicantDTO> applicants = applicationMapper.findPersonalApplicantsByProjectSq(
				projectSq, filter, searchType, keyword, size, offset);

		for (PersonalApplicantDTO applicant : applicants) {
			Long appSq = applicant.getApplicationSq();

			Long resumeSq = applicationMapper.findResumeBySq(appSq);
			List<String> skillNames = resumeSkillMapper.findAllNmBySq(resumeSq);
			applicant.setSkillNames(skillNames);

			ApplicationStatusVo appStatusVo = applicationMapper.findStatusVoByAppSq(appSq);
			applicant.setAppStatusVo(appStatusVo);

			ResumeNmTtlVo resumeNmTtlVo = resumeMapper.findResumeNmTtlBySq(resumeSq);
			applicant.setResumeNmTtlVo(resumeNmTtlVo);

			applicant.setMemberType("개인");
			applicant.setResumeSq(resumeSq);
		}

		int totalCount = applicationMapper.countPersonalApplicantsByProjectSq(projectSq, filter, searchType, keyword);
		int totalPages = (int) Math.ceil((double) totalCount / size);

		PagedApplicantResponseDTO<PersonalApplicantDTO> responseDTO = new PagedApplicantResponseDTO<>();
		responseDTO.setApplicantType("개인");
		responseDTO.setCurrentPage(page);
		responseDTO.setTotalPages(totalPages);
		responseDTO.setResponse(applicants);

		return responseDTO;
	}

	@Transactional
	public PagedApplicantResponseDTO<CorporateApplicantGroupDTO> getCorporateApplicantsGrouped(
			Long projectSq, int page, int size, String filter, String searchType, String keyword) {

		int offset = (page - 1) * size;
		List<String> companyNames = applicationMapper.findDistinctCompanyNamesByProject(projectSq, filter, searchType,
				keyword, size, offset);

		List<CorporateApplicantGroupDTO> corporateGroups = new ArrayList<>();

		for (String companyNm : companyNames) {
			List<PersonalApplicantDTO> applicants = applicationMapper.findApplicantsByProjectAndCompany(
					projectSq, companyNm, filter, searchType, keyword);

			for (PersonalApplicantDTO applicant : applicants) {
				Long appSq = applicant.getApplicationSq();
				Long resumeSq = applicationMapper.findResumeBySq(appSq);
				List<String> skillNames = resumeSkillMapper.findAllNmBySq(resumeSq);
				ApplicationStatusVo appStatusVo = applicationMapper.findStatusVoByAppSq(appSq);
				ResumeNmTtlVo resumeNmTtlVo = resumeMapper.findResumeNmTtlBySq(resumeSq);
				applicant.setSkillNames(skillNames);
				applicant.setAppStatusVo(appStatusVo);
				applicant.setResumeNmTtlVo(resumeNmTtlVo);
				applicant.setMemberType("기업");
				applicant.setCompanyNm(companyNm);
				applicant.setResumeSq(resumeSq);
			}

			CorporateApplicantGroupDTO group = new CorporateApplicantGroupDTO();
			group.setCompanyNm(companyNm);
			group.setApplicants(applicants);

			corporateGroups.add(group);
		}

		int totalCompanyCount = applicationMapper.countDistinctCompaniesByProject(projectSq, filter, searchType,
				keyword);
		int totalPages = (int) Math.ceil((double) totalCompanyCount / size);

		PagedApplicantResponseDTO<CorporateApplicantGroupDTO> responseDTO = new PagedApplicantResponseDTO<>();
		responseDTO.setApplicantType("기업");
		responseDTO.setCurrentPage(page);
		responseDTO.setTotalPages(totalPages);
		responseDTO.setResponse(corporateGroups);

		return responseDTO;
	}

	@Transactional
	public boolean checkIfUserApplied(Long userSq, Long projectSq) {
		return applicationMapper.hasAppliedProject(userSq, projectSq);
	}

}
