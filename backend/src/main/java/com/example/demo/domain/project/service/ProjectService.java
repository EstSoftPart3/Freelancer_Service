package com.example.demo.domain.project.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.company.service.CompanyService;
import com.example.demo.domain.project.dto.AddressInsertDto;

import com.example.demo.domain.project.dto.UserRole;
import com.example.demo.domain.project.dto.request.CompanyFilterRequest;
import com.example.demo.domain.project.dto.request.ContractInsertRequest;
import com.example.demo.domain.project.dto.request.JobInsertRequest;
import com.example.demo.domain.project.dto.request.ProjectApplyRequest;
import com.example.demo.domain.project.dto.request.ProjectCreateRequest;
import com.example.demo.domain.project.dto.request.ProjectSearchRequest;
import com.example.demo.domain.project.dto.request.ScrapInsertRequest;
import com.example.demo.domain.project.dto.request.ScrapRequest;
import com.example.demo.domain.project.dto.request.SkillInsertRequest;
import com.example.demo.domain.project.dto.response.AreaInfoResponse;
import com.example.demo.domain.project.dto.response.GroupSkillInfoResponse;
import com.example.demo.domain.project.dto.response.InterviewTimeInfoResponse;
import com.example.demo.domain.project.dto.response.MainProjectResponse;
import com.example.demo.domain.project.dto.response.ProjectDetailResponse;
import com.example.demo.domain.project.dto.response.ProjectFormDataResponse;
import com.example.demo.domain.project.dto.response.ProjectListResponse;
import com.example.demo.domain.project.dto.response.ProjectRecruitStatus;
import com.example.demo.domain.project.dto.response.SingleSkillInfoResponse;
import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.entity.ProjectApplicationEntity;
import com.example.demo.domain.project.mapper.AddressMapper;
import com.example.demo.domain.project.mapper.DistrictMapper;
import com.example.demo.domain.project.mapper.ProjectApplicationMapper;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.mapper.ScrapMapper;
import com.example.demo.domain.project.mapper.SkillMapper;
import com.example.demo.domain.project.util.ProjectUtil;
import com.example.demo.domain.project.vo.ExistProjectVo;
import com.example.demo.domain.project.vo.ProjectSummary;
import com.example.demo.domain.user.util.JwtAuthenticationToken;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {
	private final ProjectMapper projectMapper;
	private final CommonCodeMapper commonCodeMapper;
	private final DistrictMapper districtMapper;
	private final ProjectUtil projectUtil;
	private final SkillMapper skillMapper;
	private final AddressMapper addressMapper;
	private final ProjectApplicationMapper projectApplicationMapper;
	private final ScrapMapper scrapMapper;
	private final CompanyService companyService;

	public void createProject(ProjectCreateRequest request, JwtAuthenticationToken token) {

		long devgradeCodeSq = commonCodeMapper.findCommonCodeSqByName(request.devGrade(),
				ParentCodeEnum.DEVELOPER_GRADE.getCode());
		long educationLvlSq = commonCodeMapper.findCommonCodeSqByName(request.educationLvl(),
				ParentCodeEnum.EDUCATION.getCode());

		long userSq = token.getUserSq();
		long userTypeCd = token.getUserTypeCd();

		long companySq = companyService.fetchCompanySq(userSq, userTypeCd);
		Project project = Project.from(request, companySq, registerAddress(request), devgradeCodeSq, educationLvlSq);
		projectMapper.insertProject(project);

		registerSubEntities(project, request);
	}

	public long registerAddress(ProjectCreateRequest request) {
		AddressInsertDto addressInsertDto = AddressInsertDto.from(request);
		addressMapper.createAddress(addressInsertDto);
		return addressInsertDto.getAddressSq();
	}

	// 계약/직무/기술스택/인터뷰 시간 등 하위 항목 등록
	public void registerSubEntities(Project project, ProjectCreateRequest request) {
		createContracts(project.getProjectSq(), request.workType());
		createJobRoles(project.getProjectSq(), request.recruitJob());
		createReqSkills(project.getProjectSq(), request.usingSkills());
		createPreferSkills(project.getProjectSq(), request.preferSkills());
		createInterviewTimes(project.getProjectSq(), request.interviewTime());
	}

	// 주소코드 기반으로 하위 행정구역 정보 조회
	public AreaInfoResponse fetchSubDistrictInfoByProjectSq(Long addressSq) {
		return addressMapper.findAreaInfoBySq(addressSq);
	}

	// 주소코드 기반으로 상위 행정구역 정보 조회
	public AreaInfoResponse fetchParentDistrictInfoByCd(Long areaCode) {
		return districtMapper.findParentDisctrictByCodeSq(areaCode);
	}

	// 주소 문자열로 변환 (ex: "서울 강남구")
	public String fetchAddressString(Long addressSq) {
		AreaInfoResponse subDistrict = addressMapper.findAreaInfoBySq(addressSq);
		AreaInfoResponse parentDistrict = districtMapper.findParentDisctrictByCodeSq(subDistrict.getAreaSq());

		String parentName = parentDistrict.getAreaName().replace("전체", "").trim();
		return parentName + " " + subDistrict.getAreaName();
	}

	// 검색 조건에 따라 전체 프로젝트 목록 조회
	public ProjectListResponse fetchAllProject(JwtAuthenticationToken token, ProjectSearchRequest request) {
		List<Project> projects = projectMapper.findProjectsBySearch(request);
		Long totalCount = projectMapper.countProjectsBySearch(request);
		List<ProjectSummary> responses = new ArrayList<>();

		Long userSq = (token != null) ? token.getUserSq() : null;

		projects.forEach(
				p -> {
					String address = fetchAddressString(p.getAddressSq());
					String status = projectMapper.judgeProjectRecruitStatus(p.getProjectSq());

					String hasScrapped = "N";
					if (userSq != null) {
						hasScrapped = (scrapMapper.findScrapSqByUserSqAndProjectSq(userSq, p.getProjectSq()) != null)
								? "Y"
								: "N";
					}

					String companyImageUrl = companyService.fetchCompanyImageUrl(p.getCompanySq());
					responses.add(ProjectSummary.from(p, projectUtil, address, status, hasScrapped, companyImageUrl));
				});

		int page = (request.getOffset() / request.getSize()) + 1;

		// TODO: 기본값 1로 수정해야 함.
		int totalPages = (int) Math.ceil((double) totalCount / request.getSize());

		return new ProjectListResponse(page, request.getSize(), totalCount, totalPages, responses);
	}

	// 기업 기준의 프로젝트 목록 조회
	public ProjectListResponse fetchCompanyProject(CompanyFilterRequest request,
			JwtAuthenticationToken jwtAuthenticationToken) {

		Long userSq = jwtAuthenticationToken.getUserSq();
		Long userTypeCd = jwtAuthenticationToken.getUserTypeCd();

		long companySq = companyService.fetchCompanySq(userSq, userTypeCd);

		Long totalCount = projectMapper.countCompanyProjectsBySearch(request, companySq);

		List<Project> projects = projectMapper.findProjectsByCompany(companySq, request);

		List<ProjectSummary> responses = new ArrayList<>();

		projects.forEach(
				p -> {
					String address = fetchAddressString(p.getAddressSq());
					String status = projectMapper.judgeProjectRecruitStatus(p.getProjectSq());

					String hasScrapped = (scrapMapper.findScrapSqByUserSqAndProjectSq(userSq, p.getProjectSq()) != null)
							? "Y"
							: "N";
					String companyImageUrl = companyService.fetchCompanyImageUrl(p.getCompanySq());
					responses.add(ProjectSummary.from(p, projectUtil, address, status, hasScrapped, companyImageUrl));
				});

		int page = (request.getOffset() / request.getSize()) + 1;

		// TODO: 기본값 1로 수정해야 함.
		int totalPages = (int) Math.ceil((double) totalCount / request.getSize());

		return new ProjectListResponse(page, request.getSize(), totalCount, totalPages, responses);

	}

	public ProjectRecruitStatus fetchCompanyProjectCount(CompanyFilterRequest request,
			JwtAuthenticationToken jwtAuthenticationToken) {

		Long userSq = jwtAuthenticationToken.getUserSq();
		Long userTypeCd = jwtAuthenticationToken.getUserTypeCd();

		Long companySq = companyService.fetchCompanySq(userSq, userTypeCd);

		return projectMapper.countCompanyProjectsByStatus(request, companySq);
	}

	public ProjectDetailResponse fetchProject(Long projectSq, JwtAuthenticationToken token) {
		projectMapper.updateViewCnt(projectSq);
		Project p = projectMapper.findBySq(projectSq);

		if (p.getProjectIsDeletedYn().equals("Y")) {
			throw new RuntimeException("이미 삭제된 프로젝트 입니다.");
		}

		List<GroupSkillInfoResponse> reqSkills = groupingSkills(projectMapper.findReqSkillsByProjectSq(projectSq));
		List<GroupSkillInfoResponse> preferSkills = groupingSkills(
				projectMapper.findPreferSkillsByProjectSq(projectSq));
		String projectAddress = fetchAddressString(p.getAddressSq());

		int hasScrapped = 0;
		int hasApplied = 0;
		UserRole userRole = UserRole.PERSONAL; // 기본값 설정

		if (token != null) {
			Long userSq = token.getUserSq();
			Long userTypeCd = token.getUserTypeCd();

			Long scrapSq = scrapMapper.findScrapSqByUserSqAndProjectSq(userSq, projectSq);
			hasScrapped = (scrapSq != null) ? 1 : 0;

			if (userTypeCd.equals(302)) {
				Long companySq = companyService.fetchCompanySq(userSq, userTypeCd);
				hasApplied = projectApplicationMapper.findByProAndCom(projectSq, companySq) != null ? 1 : 0;
			} else {
				hasApplied = projectApplicationMapper.findByProAndUser(projectSq, userSq) != null ? 1 : 0;
			}
			userRole = findUserRole(token, p);
		}

		return ProjectDetailResponse.from(p, projectUtil, reqSkills, preferSkills, projectAddress, hasScrapped,
				hasApplied, userRole);
	}

	public Long fetchScrapCount(Long projectSq) {
		return projectMapper.findProjectScrapCnt(projectSq);
	}

	@Transactional
	public void updateSkills(Project project, ProjectCreateRequest request) {
		skillMapper.deleteReqSkillsByProjectSq(project.getProjectSq());
		skillMapper.deletePreferSkillsByProjectSq(project.getProjectSq());
		createPreferSkills(project.getProjectSq(), request.preferSkills());
		createReqSkills(project.getProjectSq(), request.usingSkills());
	}

	@Transactional
	public void updateContracts(Project project, ProjectCreateRequest request) {
		long projectSq = project.getProjectSq();
		projectMapper.deleteProjectContracts(projectSq);
		projectMapper.insertContracts(projectSq, fillContractInsertRequest(projectSq, request.workType()));
	}

	@Transactional
	public void updateJobRoles(Project project, ProjectCreateRequest request) {
		long projectSq = project.getProjectSq();
		projectMapper.deleteProjectJobRoles(projectSq);
		projectMapper.insertJobs(projectSq, fillJobInsertRequest(projectSq, request.recruitJob()));
	}

	@Transactional
	public void updateInterviewTimes(Project project, ProjectCreateRequest request) {
		long projectSq = project.getProjectSq();
		projectMapper.deleteProjectInterviewTimes(projectSq);
		createInterviewTimes(projectSq, request.interviewTime());
	}

	public void updateAddress(Project project, ProjectCreateRequest request) {
		projectMapper.deleteProjectAddress(project.getAddressSq()); // 기존 주소 삭제
		long newAddressSq = registerAddress(request); // 새 주소 insert
		projectMapper.updateAddress(project.getProjectSq(), newAddressSq); // 바로 갱신
	}

	@Transactional
	public void updateProject(ProjectCreateRequest request) {

		Project p = projectMapper.findBySq(request.projectId());
		if (p.getProjectIsDeletedYn().equals("Y")) {
			throw new RuntimeException("이미 삭제된 프로젝트 입니다.");
		}

		long devGradeCodeSq = commonCodeMapper.findCommonCodeSqByName(request.devGrade(),
				ParentCodeEnum.DEVELOPER_GRADE.getCode());
		long educationLvlSq = commonCodeMapper.findCommonCodeSqByName(request.educationLvl(),
				ParentCodeEnum.EDUCATION.getCode());

		Project project = projectMapper.findBySq(request.projectId());
		project.update(request, devGradeCodeSq, educationLvlSq);
		projectMapper.updateProject(project);

		updateSubEntities(project, request);
	}

	@Transactional
	public void updateSubEntities(Project project, ProjectCreateRequest request) {
		updateSkills(project, request);
		updateContracts(project, request);
		updateJobRoles(project, request);
		updateInterviewTimes(project, request);
		updateAddress(project, request);
	}

	public void softDeleteProject(long projectSq) {
		projectMapper.softDeleteProject(projectSq);
	}

	public void createProjectApplication(long projectSq, ProjectApplyRequest request, Long userSq) {
		Optional<Long> userCompanySq = Optional.ofNullable(companyService.fetchCompanySq(userSq));

		request.getResumeSq().forEach(
				rSq -> {
					ProjectApplicationEntity projectApplicationEntity = ProjectApplicationEntity.from(projectSq,
							projectMapper, rSq, request.getProjectApplicationTyp(), commonCodeMapper, userCompanySq);
					projectMapper.insertProjectApplication(projectApplicationEntity);
					projectMapper.increaseApplication(projectSq);
				});
	}

	@Transactional
	public void toggleProjectScrap(long projectSq, ScrapRequest scrapRequest, Long userSq) {
		boolean hasScrapped = scrapRequest.isHasScrapped();
		if (!hasScrapped) {
			long scrapTypeCd = commonCodeMapper.findCommonCodeSqByName(scrapRequest.getTarget(),
					ParentCodeEnum.SCRAP_TYPE.getCode());
			ScrapInsertRequest scrapInsertRequest = new ScrapInsertRequest(userSq, projectSq, scrapTypeCd);
			projectMapper.insertScrap(scrapInsertRequest);
			projectMapper.increaseScrap(projectSq);

		} else {
			projectMapper.deleteProjectScrap(projectSq, userSq);
			projectMapper.decreaseScrap(projectSq);
		}

	}

	@Transactional
	public void createContracts(Long projectSq, List<String> workTypes) {
		List<ContractInsertRequest> requests = fillContractInsertRequest(projectSq, workTypes);
		projectMapper.insertContracts(projectSq, requests);
	}

	@Transactional
	public void createJobRoles(Long projectSq, List<String> recruitJobs) {
		List<JobInsertRequest> requests = fillJobInsertRequest(projectSq, recruitJobs);
		projectMapper.insertJobs(projectSq, requests);
	}

	@Transactional
	public void createReqSkills(Long projectSq, List<String> reqSkills) {
		List<SkillInsertRequest> skillInsertRequests = fillSkillInsertRequest(reqSkills);
		projectMapper.insertSkills(projectSq, skillInsertRequests);
	}

	@Transactional
	public void createPreferSkills(Long projectSq, List<String> preferSkills) {
		List<SkillInsertRequest> skillInsertRequests = fillSkillInsertRequest(preferSkills);
		projectMapper.insertPreferSkills(projectSq, skillInsertRequests);
	}

	@Transactional
	public void createInterviewTimes(Long projectSq, List<LocalDateTime> interviewTimes) {
		projectMapper.insertInterviewTimes(projectSq, interviewTimes);
	}

	// DB에 들어가는 형태로 변환
	public List<SkillInsertRequest> fillSkillInsertRequest(List<String> skills) {
		List<SkillInsertRequest> requests = new ArrayList<>();
		skills.forEach(skillName -> {
			SkillInsertRequest request = skillMapper.findSkillTagInfoByName(skillName);
			requests.add(request);
		});
		return requests;
	}

	public List<ContractInsertRequest> fillContractInsertRequest(Long projectSq, List<String> contracts) {
		List<ContractInsertRequest> requests = new ArrayList<>();
		contracts.forEach(contractName -> {
			ContractInsertRequest request = new ContractInsertRequest(projectSq,
					commonCodeMapper.findCommonCodeSqByName(contractName, ParentCodeEnum.CONTRACT_TYPE.getCode()));
			requests.add(request);
		});
		return requests;
	}

	public List<JobInsertRequest> fillJobInsertRequest(Long projectSq, List<String> recruitJobs) {
		List<JobInsertRequest> requests = new ArrayList<>();
		recruitJobs.forEach(jobName -> {
			JobInsertRequest request = new JobInsertRequest(projectSq,
					commonCodeMapper.findCommonCodeSqByName(jobName, ParentCodeEnum.JOB_POSITION.getCode()));
			requests.add(request);
		});
		return requests;
	}

	public ProjectFormDataResponse fetchProjectFormDatas(long projectSq) {
		List<GroupSkillInfoResponse> skills = groupingSkills(projectMapper.findSkillFormList());
		if (projectSq != 0L) {
			Project project = projectMapper.findBySq(projectSq);
			AreaInfoResponse areaInfoResponse = fetchSubDistrictInfoByProjectSq(project.getAddressSq());
			ExistProjectVo existProjectVo = ExistProjectVo.from(project,
					projectUtil,
					skillMapper.findAllReqSkillsByProjectSq(projectSq),
					skillMapper.findAllPreferSkillsByProjectSq(projectSq).reversed(),
					fetchParentDistrictInfoByCd(areaInfoResponse.getAreaSq()),
					areaInfoResponse);
			return ProjectFormDataResponse.from(commonCodeMapper, districtMapper, skills, existProjectVo);
		}
		return ProjectFormDataResponse.from(commonCodeMapper, districtMapper, skills);
	}

	// fetch 해온 기술들을 상위 분류에 따라 분류.
	public List<GroupSkillInfoResponse> groupingSkills(List<SingleSkillInfoResponse> responses) {
		Map<String, List<String>> grouped = responses.stream()
				.collect(Collectors.groupingBy(
						SingleSkillInfoResponse::getParentSkillTagNm,
						Collectors.mapping(SingleSkillInfoResponse::getChildSkillTagNm, Collectors.toList())));

		List<GroupSkillInfoResponse> result = grouped.entrySet().stream()
				.map(e -> new GroupSkillInfoResponse(e.getKey(), e.getValue()))
				.collect(Collectors.toList());

		return result;
	}

	public List<AreaInfoResponse> fetchDistricts(Long areaCodeSq) {
		return districtMapper.findAllDistrictByParent(areaCodeSq);
	}

	// 검색 필터에 들어갈 내용을 DB에서 조회
	public List<?> fetchFilterInfos(String type) {
		switch (type) {
			case "지역":
				return districtMapper.findAllParentDistrict();
			case "경력":
				return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.DEVELOPER_GRADE.getCode());
			case "학력":
				return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.EDUCATION.getCode());
			case "직종":
				return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.JOB_POSITION.getCode());
			default:
				throw new IllegalArgumentException("Unexpected value: " + type);
		}
	}

	public List<InterviewTimeInfoResponse> fetchProjectAvailableTimes(Long projectSq) {
		return projectMapper.findInterviewSqTmByProjectSq(projectSq);
	}

	public UserRole findUserRole(JwtAuthenticationToken token, Project project) {
		Long userSq = token.getUserSq();
		Long userTypeCd = token.getUserTypeCd();
		Long companySq = project.getCompanySq();
		Long userCompanySq = companyService.fetchCompanySq(userSq);
		String ownedCompanyBizNum = companyService.fetchCompanyBizNumByCompany(companySq);

		// 개인 사용자
		if (userTypeCd
				.equals(commonCodeMapper.findCommonCodeSqByEngName("PERSONAL", ParentCodeEnum.MEMBER_TYPE.getCode()))) {
			return UserRole.PERSONAL;
		}
		// 프로젝트 공고를 작성한 사람
		else if (userTypeCd
				.equals(commonCodeMapper.findCommonCodeSqByEngName("COMPANY", ParentCodeEnum.MEMBER_TYPE.getCode()))
				&& userSq.equals(companyService.fetchUserSq(companySq))
				&& ownedCompanyBizNum.equals(companyService.fetchCompanyBizNumByCompany(userCompanySq))) {
			return UserRole.COMPANY_AUTHOR;
		}
		// 위 사람과 같은 기업에 속하는 멤버
		else if (userTypeCd
				.equals(commonCodeMapper.findCommonCodeSqByEngName("COMPANY", ParentCodeEnum.MEMBER_TYPE.getCode()))
				&& !userSq.equals(companyService.fetchUserSq(companySq))
				&& ownedCompanyBizNum.equals(companyService.fetchCompanyBizNumByCompany(userCompanySq))) {
			return UserRole.COMPANY_MEMBER;
		}
		return UserRole.COMPANY_EXTERNAL;
	}

	// 메인페이지용
	public List<MainProjectResponse> fetchMainPopularProjects(String sortType) {
		// 1. 기본 프로젝트 리스트 조회 (5~6개)
		List<Project> projects = projectMapper.selectMainPopularProjects(sortType, 5);

		return projects.stream().map(p -> {
			Long sq = p.getProjectSq();

			// 2. 기존 util 및 mapper 메서드 재활용
			String address = fetchAddressString(p.getAddressSq()); // 기존 메서드
			String experience = projectUtil.convertCommonCodeSqToNm(p.getProjectDeveloperGradeCd());

			// 3. 기술 스택 가져오기 (상세페이지 로직 활용)
			// 간단하게 이름 리스트만 추출
			List<String> skillNames = projectMapper.findReqSkillsByProjectSq(sq)
					.stream()
					.map(s -> s.getChildSkillTagNm())
					.toList();

			return MainProjectResponse.builder()
					.projectSq(sq)
					.projectTtl(p.getProjectTtl())
					.companyNm(projectUtil.convertCompanySqToName(p.getCompanySq()))
					.projectAddress(address)
					.projectExperience(experience)
					.projectSalary(p.getProjectSalary())
					.formattedSalary(formatSalary(p.getProjectSalary())) // 단가 가공 로직
					.projectSkills(skillNames)
					.build();
		}).collect(Collectors.toList());
	}

	// 단가 가공 로직 예시
	private String formatSalary(Long salary) {
		if (salary == null || salary == 0)
			return "단가 협의";
		return "월 " + (salary / 10000) + "만원";
	}
}
