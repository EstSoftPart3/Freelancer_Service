package com.example.demo.domain.project.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
	public void updateApplicantResult(ApplicationStatusRequest request, Long applicationSq, Long userSq) {
		Long statusCd = commonCodeMapper.findCommonCodeSqByName(request.getStatus(),
				ParentCodeEnum.PRO_APPLICATION.getCode());
		if (statusCd == null) {
			throw new IllegalArgumentException("알 수 없는 지원 상태입니다.");
		}
		// 예전엔 요청자를 보지 않아 로그인한 누구나 아무 지원의 상태를 바꿀 수 있었다(§10 A13).
		// 지원취소는 지원 당사자(이력서 주인·대리지원한 회사), 그 외(합격·불합격·인터뷰 요청 등)는 공고를 올린 회사만.
		if (statusCd.equals(806L)) {
			requireApplicant(applicationSq, userSq);
			// 지원중(801)만 취소 — 예전엔 불합격·인터뷰 확정·이미 취소된 지원도 취소돼 지원자 수가 거듭 줄었다.
			if (!Long.valueOf(801L).equals(asLong(requireParties(applicationSq).get("statusCd")))) {
				throw new IllegalArgumentException("지원중인 지원만 취소할 수 있습니다.");
			}
		} else if (!Objects.equals(companyMapper.findCompanySqByUserSq(userSq),
				asLong(requireParties(applicationSq).get("projectCompanySq")))) {
			throw new IllegalArgumentException("이 지원의 상태를 변경할 권한이 없습니다.");
		}

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
	public void updateInterviewTimeSelected(Long interviewTimeSq, ApplicationSqRequest request, Long userTypeCd,
			Long userSq) {
		requireApplicant(request.getApplicationSq(), userSq);
		Long projectSq = applicationMapper.findProjectBySq(request.getApplicationSq());
		Project project = projectMapper.findBySq(projectSq);

		// 삭제된 프로젝트에는 인터뷰 신청 불가
		if (project.getProjectIsDeletedYn().equals("Y")) {
			throw new RuntimeException("이미 삭제된 프로젝트 입니다.");
		}

		// 개인회원(301)은 모집 기간 만료 후 인터뷰 시간 선택 불가
		if (userTypeCd.equals(301L)) {
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
			Long interviewProjectSq = (Long) info.get("projectSq");
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
				String companyTargetUrl = "/mypage/affiliationProjectList?projectSq=" + interviewProjectSq + "&appTyp=" + appTyp;

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

	private static final String[] APPLICANT_STATUS_FILTERS = {
			"passed", "in_progress", "interview_confirmed", "interview_requested", "rejected" };

	/**
	 * 지원현황 조회 3종(개인·기업·집계) 공통 가드. 이 셋 다 인증 주체 확인이 없어서,
	 * /api/projects 가 JwtAuthenticationFilter.EXCLUDE_URLS 접두사에 걸려 있는 것과 맞물려
	 * 프로젝트 번호만 알면 누구나 그 회사의 지원자 현황(이름·이력서·상태)을 볼 수 있었다
	 * (2026-09-14, 28번 작업 중 발견). 이 프로젝트를 등록한 회사 계정만 통과시킨다.
	 */
	private void requireProjectOwner(Long projectSq, Long userSq) {
		Long ownerUserSq = projectMapper.findUserSqByProjectSq(projectSq);
		if (ownerUserSq == null || !ownerUserSq.equals(userSq)) {
			throw new IllegalArgumentException("해당 프로젝트의 지원 현황을 조회할 권한이 없습니다.");
		}
	}

	/**
	 * 지원현황 모달의 상태별 탭 배지 집계. 지금까지는 프런트가 현재 페이지·필터로 로드된
	 * 목록(allApplicants)만으로 배지를 계산해, 여러 페이지에 걸친 지원자는 "전체" 배지가
	 * 실제 전체 건수가 아니라 현재 페이지 건수만 보여줬다(2026-09-14, 28번). 페이징과
	 * 무관하게 상태별로 각각 COUNT 해서 돌려준다.
	 */
	@Transactional(readOnly = true)
	public Map<String, Integer> getApplicantStatusCounts(
			Long projectSq, String applicantType, String searchType, String keyword, Long userSq) {
		requireProjectOwner(projectSq, userSq);
		Map<String, Integer> counts = new HashMap<>();
		boolean corporate = "corporate".equals(applicantType);
		int all = corporate
				? applicationMapper.countCorporateApplicantsByProjectSq(projectSq, "all", searchType, keyword)
				: applicationMapper.countPersonalApplicantsByProjectSq(projectSq, "all", searchType, keyword);
		counts.put("all", all);
		for (String filter : APPLICANT_STATUS_FILTERS) {
			int cnt = corporate
					? applicationMapper.countCorporateApplicantsByProjectSq(projectSq, filter, searchType, keyword)
					: applicationMapper.countPersonalApplicantsByProjectSq(projectSq, filter, searchType, keyword);
			counts.put(filter, cnt);
		}
		return counts;
	}

	@Transactional
	public PagedApplicantResponseDTO<PersonalApplicantDTO> getPersonalApplicants(
			Long projectSq, int page, int size, String filter, String searchType, String keyword, Long userSq) {
		requireProjectOwner(projectSq, userSq);

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
			Long projectSq, int page, int size, String filter, String searchType, String keyword, Long userSq) {
		requireProjectOwner(projectSq, userSq);

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

	private Map<String, Object> requireParties(Long applicationSq) {
		Map<String, Object> parties = applicationMapper.findApplicationParties(applicationSq);
		if (parties == null) {
			throw new IllegalArgumentException("지원 정보를 찾을 수 없습니다.");
		}
		return parties;
	}

	/** 지원 당사자: 이력서 주인 본인 또는 대리지원한 회사의 기업 계정 */
	private void requireApplicant(Long applicationSq, Long userSq) {
		Map<String, Object> parties = requireParties(applicationSq);
		if (Objects.equals(userSq, asLong(parties.get("ownerSq")))) {
			return;
		}
		Long applyCompanySq = asLong(parties.get("applyCompanySq"));
		if (applyCompanySq == null || !applyCompanySq.equals(companyMapper.findCompanySqByUserSq(userSq))) {
			throw new IllegalArgumentException("본인의 지원만 처리할 수 있습니다.");
		}
	}

	private static Long asLong(Object v) {
		return v == null ? null : ((Number) v).longValue();
	}

	/**
	 * 기업 회원 탈퇴 시(§10 A20) 그 회사 공고에 들어온 진행 중 지원을 지원취소(806)하고 지원자(대리지원이면 대리지원한
	 * 회사도)에게 알린 뒤, 회사 공고를 전부 소프트삭제한다. 처리할 담당자가 없는데 지원이 계속 들어오면 안 된다.
	 */
	@Transactional
	public void closeCompanyProjectsOnWithdraw(Long companySq) {
		for (Map<String, Object> app : applicationMapper.findActiveApplicationsOnCompanyProjects(companySq)) {
			applicationMapper.updateApplicationStatus(806L, asLong(app.get("appSq")));
			String message = "[" + app.get("projectTtl") + "] 프로젝트의 기업이 탈퇴하여 지원이 취소되었습니다.";
			notificationService.send(asLong(app.get("applicantUserSq")), null, 2602L, message, "/mypage/appliedProjects");
			Long applyCompanyUserSq = asLong(app.get("applyCompanyUserSq"));
			if (applyCompanyUserSq != null) {
				notificationService.send(applyCompanyUserSq, null, 2602L, message, "/mypage/appliedProjects");
			}
		}
		projectMapper.softDeleteProjectsByCompany(companySq);
	}

	/**
	 * 소속에서 빠질 때(기업의 퇴사 처리·개인 탈퇴·회원 탈퇴·관리자 소속 해제) 그 회사가 이 사람으로 낸 진행 중
	 * 대리지원을 지원취소(806)한다(§10 A12). 더는 그 회사 인력이 아니므로 공고 기업이 계속 심사하면 안 된다.
	 */
	@Transactional
	public void cancelCorporateApplicationsOnLeave(Long userSq, Long companySq) {
		if (userSq == null || companySq == null) {
			return;
		}
		for (Long appSq : applicationMapper.findActiveCorporateApplicationSqs(userSq, companySq)) {
			applicationMapper.updateApplicationStatus(806L, appSq);
			projectMapper.decreaseApplication(applicationMapper.findProjectBySq(appSq));

			Map<String, Object> info = applicationMapper.findCancelNotificationInfo(appSq);
			if (info != null) {
				String message = "[" + info.get("projectTtl") + "] 프로젝트의 기업 지원(" + info.get("applicantNm")
						+ "님)이 소속 퇴사로 취소되었습니다.";
				notificationService.send(asLong(info.get("companyUserSq")), null, 2602L, message,
						"/mypage/affiliationProjectList?projectSq=" + info.get("projectSq") + "&appTyp=corporate");
				notificationService.send(userSq, null, 2602L, message, "/mypage/appliedProjects");
			}
		}
	}
}
