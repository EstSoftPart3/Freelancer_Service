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
import com.example.demo.domain.project.dto.CorporateApplicantGroupDTO;
import com.example.demo.domain.project.dto.PersonalApplicantDTO;
import com.example.demo.domain.project.dto.request.ApplicationSqRequest;
import com.example.demo.domain.project.dto.request.ApplicationStatusRequest;
import com.example.demo.domain.project.dto.response.ApplicationStatusList;
import com.example.demo.domain.project.dto.response.ApplicationStatusResponse;
import com.example.demo.domain.project.dto.response.PagedApplicantResponseDTO;
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

	public PagedApplicantResponseDTO<PersonalApplicantDTO> getPersonalApplicants(Long projectSq, int page, int size) {
		int offset = (page - 1) * size;
		List<PersonalApplicantDTO> applicants = applicationMapper.findPersonalApplicantsByProjectSq(projectSq, size,
				offset);

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
		}

		int totalCount = applicationMapper.countPersonalApplicantsByProjectSq(projectSq);
		int totalPages = (int) Math.ceil((double) totalCount / size);

		PagedApplicantResponseDTO<PersonalApplicantDTO> responseDTO = new PagedApplicantResponseDTO<>();
		responseDTO.setApplicantType("개인");
		responseDTO.setCurrentPage(page);
		responseDTO.setTotalPages(totalPages);
		responseDTO.setResponse(applicants);

		return responseDTO;
	}

	public PagedApplicantResponseDTO<CorporateApplicantGroupDTO> getCorporateApplicantsGrouped(Long projectSq, int page,
			int size) {
		int offset = (page - 1) * size;
		List<String> companyNames = applicationMapper.findDistinctCompanyNamesByProject(projectSq, size, offset);

		List<CorporateApplicantGroupDTO> corporateGroups = new ArrayList<>();

		for (String companyNm : companyNames) {
			List<PersonalApplicantDTO> applicants = applicationMapper.findApplicantsByProjectAndCompany(projectSq,
					companyNm);

			for (PersonalApplicantDTO applicant : applicants) {
				Long appSq = applicant.getApplicationSq();
				Long resumeSq = applicationMapper.findResumeBySq(applicant.getApplicationSq());
				List<String> skillNames = resumeSkillMapper.findAllNmBySq(resumeSq);
				ApplicationStatusVo appStatusVo = applicationMapper.findStatusVoByAppSq(appSq);
				ResumeNmTtlVo resumeNmTtlVo = resumeMapper.findResumeNmTtlBySq(resumeSq);
				applicant.setSkillNames(skillNames);
				applicant.setAppStatusVo(appStatusVo);
				applicant.setResumeNmTtlVo(resumeNmTtlVo);
				applicant.setMemberType("기업");
				applicant.setCompanyNm(companyNm);
			}

			CorporateApplicantGroupDTO group = new CorporateApplicantGroupDTO();
			group.setCompanyNm(companyNm);
			group.setApplicants(applicants);

			corporateGroups.add(group);
		}

		int totalCompanyCount = applicationMapper.countDistinctCompaniesByProject(projectSq);
		int totalPages = (int) Math.ceil((double) totalCompanyCount / size);

		PagedApplicantResponseDTO<CorporateApplicantGroupDTO> responseDTO = new PagedApplicantResponseDTO<>();
		responseDTO.setApplicantType("기업");
		responseDTO.setCurrentPage(page);
		responseDTO.setTotalPages(totalPages);
		responseDTO.setResponse(corporateGroups);

		return responseDTO;
	}
}
