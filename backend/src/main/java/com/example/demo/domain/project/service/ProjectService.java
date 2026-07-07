package com.example.demo.domain.project.service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.affiliation.mapper.AffiliationMapper;
import com.example.demo.domain.company.service.CompanyService;
import com.example.demo.domain.project.dto.AddressInsertDto;
import com.example.demo.domain.project.dto.ProjectRegionGroupDTO;
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
import com.example.demo.domain.user.dto.request.NotificationBatchRequestDTO;
import com.example.demo.domain.user.service.NotificationService;
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
	private final NotificationService notificationService;
	private final AffiliationMapper affiliationMapper;

	@Transactional
	public void createProject(ProjectCreateRequest request, JwtAuthenticationToken token) {

		long devgradeCodeSq = commonCodeMapper.findCommonCodeSqByName(request.devGrade(),
				ParentCodeEnum.DEVELOPER_GRADE.getCode());
		long educationLvlSq = commonCodeMapper.findCommonCodeSqByName(request.educationLvl(),
				ParentCodeEnum.EDUCATION.getCode());

		long userSq = token.getUserSq();
		long userTypeCd = token.getUserTypeCd();

		long companySq = companyService.fetchCompanySq(userSq, userTypeCd);

		Long detailedAddressSq = null;
		if (request.detailedAddressName() != null && !request.detailedAddressName().isBlank()) {
			detailedAddressSq = registerAddressWithDbCheck(
					request.detailedSigunguCode(),
					AddressInsertDto.forDetailed(request));
		}

		Long subwayAddressSq = null;
		if (request.subwayAddressName() != null && !request.subwayAddressName().isBlank()) {
			subwayAddressSq = registerAddressWithDbCheck(
					request.subwaySigunguCode(),
					AddressInsertDto.forSubway(request));
		}

		// 3. 프로젝트 엔티티 생성 및 저장 (수정된 from 메서드 사용)
		Project project = Project.from(
				request,
				companySq,
				detailedAddressSq,
				subwayAddressSq,
				devgradeCodeSq,
				educationLvlSq);
		projectMapper.insertProject(project);

		registerSubEntities(project, request);
		// ================= [ 스크랩 유저 배치 알림 발송 ] =================

		// 2. 해당 기업을 즐겨찾기(602)한 유저 및 타입 정보 조회
		if ("Y".equals(request.isNotification())) {

			List<Map<String, Object>> scrapUserInfos = affiliationMapper.findScrapUserInfos(companySq);

			if (scrapUserInfos != null && !scrapUserInfos.isEmpty()) {
				String companyNm = affiliationMapper.findCompanyNameBySq(companySq);
				String projectTitle = request.projectTitle();
				String message = String.format("즐겨찾기한 [%s]에서 새 공고가 등록되었습니다: %s", companyNm, projectTitle);
				Long projectSq = project.getProjectSq();

				List<NotificationBatchRequestDTO> batchList = new ArrayList<>();

				for (Map<String, Object> userInfo : scrapUserInfos) {
					Long receiverSq = Long.valueOf(userInfo.get("userSq").toString());
					Long receiverTypeCd = Long.valueOf(userInfo.get("userTypeCd").toString());

					String targetUrl = (receiverTypeCd.equals(302L))
							? "/project/spec/company/" + projectSq
							: "/project/spec/user/" + projectSq;

					batchList.add(new NotificationBatchRequestDTO(
							receiverSq,
							userSq,
							2604L,
							message,
							targetUrl));
				}

				notificationService.insertNotificationBatch(batchList);
			}
		}
	}

	@Transactional
	public void createProject(ProjectCreateRequest request) {
		// ... 기존 로직 ...

		// 1. 상세 주소 등록
		Long detailedAddressSq = null;
		if (request.detailedAddressName() != null && !request.detailedAddressName().isBlank()) {
			detailedAddressSq = registerAddressWithDbCheck(
					request.detailedSigunguCode(),
					AddressInsertDto.forDetailed(request));
		}

		// 2. 지하철 주소 등록
		Long subwayAddressSq = null;
		if (request.subwayAddressName() != null && !request.subwayAddressName().isBlank()) {
			subwayAddressSq = registerAddressWithDbCheck(
					request.subwaySigunguCode(),
					AddressInsertDto.forSubway(request));
		}

		// ... 이후 insertProject 진행 ...
	}

	// [공통] DB에서 명칭을 찾아 DTO에 세팅 후 저장하는 프라이빗 메서드
	private Long registerAddressWithDbCheck(String codeStr, AddressInsertDto dto) {
		if (codeStr != null && !codeStr.isBlank()) {
			Long code = Long.parseLong(codeStr);
			// DB에서 해당 코드의 정확한 명칭 조회
			String sigunguName = districtMapper.findSigunguByCode(code);

			// 조회된 명칭을 DTO에 강제 세팅 (setter가 없다면 DTO에 추가 필요)
			dto.setSigungu(sigunguName);
		}

		addressMapper.createAddress(dto);
		return dto.getAddressSq();
	}

	// [신규] 상세 주소 등록 메서드
	private Long registerDetailedAddress(ProjectCreateRequest request) {
		AddressInsertDto addressDto = AddressInsertDto.forDetailed(request);
		addressMapper.createAddress(addressDto);
		return addressDto.getAddressSq();
	}

	// [신규] 지하철 주소 등록 메서드
	private Long registerSubwayAddress(ProjectCreateRequest request) {
		AddressInsertDto addressDto = AddressInsertDto.forSubway(request);
		addressMapper.createAddress(addressDto);
		return addressDto.getAddressSq();
	}

	@Transactional
	// 계약/직무/기술스택/인터뷰 시간 등 하위 항목 등록
	public void registerSubEntities(Project project, ProjectCreateRequest request) {
		createContracts(project.getProjectSq(), request.workType());
		createJobRoles(project.getProjectSq(), request.recruitJob());
		createReqSkills(project.getProjectSq(), request.usingSkills());
		createPreferSkills(project.getProjectSq(), request.preferSkills());
		createInterviewTimes(project.getProjectSq(), request.interviewTime());
	}

	@Transactional
	// 주소코드 기반으로 하위 행정구역 정보 조회
	public AreaInfoResponse fetchSubDistrictInfoByProjectSq(Long addressSq) {
		return addressMapper.findAreaInfoBySq(addressSq);
	}

	@Transactional
	// 주소코드 기반으로 상위 행정구역 정보 조회
	public AreaInfoResponse fetchParentDistrictInfoByCd(Long areaCode) {
		return districtMapper.findParentDisctrictByCodeSq(areaCode);
	}

	@Transactional
	// 주소 문자열로 변환 (ex: "서울 강남구")
	public String fetchAddressString(Long addressSq) {
		// [수정] addressSq가 null이면 빈 문자열 반환 (지하철 전용 공고 등)
		if (addressSq == null) {
			return "";
		}

		AreaInfoResponse subDistrict = addressMapper.findAreaInfoBySq(addressSq);

		// [추가] subDistrict 조회 결과가 없을 경우 대비
		if (subDistrict == null) {
			return "";
		}

		AreaInfoResponse parentDistrict = districtMapper.findParentDisctrictByCodeSq(subDistrict.getAreaSq());

		if (parentDistrict == null) {
			return subDistrict.getAreaName(); // 부모 정보 없으면 구 이름만이라도 반환
		}

		String parentName = parentDistrict.getAreaName().replace("전체", "").trim();
		return parentName + " " + subDistrict.getAreaName();
	}

	@Transactional
	// 검색 조건에 따라 전체 프로젝트 목록 조회
	public ProjectListResponse fetchAllProject(JwtAuthenticationToken token, ProjectSearchRequest request) {

		List<Project> projects = projectMapper.findProjectsBySearch(request);
		Long totalCount = projectMapper.countProjectsBySearch(request);
		List<ProjectSummary> responses = new ArrayList<>();

		Long userSq = (token != null) ? token.getUserSq() : null;

		projects.forEach(p -> {
			String address = fetchAddressString(p.getAddressSq());
			String status = projectMapper.judgeProjectRecruitStatus(p.getProjectSq());

			// [추가] 단가 가공 로직 적용
			String formattedSalary = formatSalary(p.getProjectSalary());

			String hasScrapped = "N";
			if (userSq != null) {
				hasScrapped = (scrapMapper.findScrapSqByUserSqAndProjectSq(userSq, p.getProjectSq()) != null)
						? "Y"
						: "N";
			}

			String companyImageUrl = companyService.fetchCompanyImageUrl(p.getCompanySq());

			// [수정] 가공된 급여(formattedSalary)를 포함하여 VO 생성
			responses.add(ProjectSummary.from(p, projectUtil, address, status, hasScrapped, companyImageUrl,
					formattedSalary));
		});

		int page = (request.getOffset() / request.getSize()) + 1;
		int totalPages = (int) Math.ceil((double) totalCount / request.getSize());

		return new ProjectListResponse(page, request.getSize(), totalCount, totalPages, responses);
	}

	@Transactional
	// 기업 기준의 프로젝트 목록 조회
	public ProjectListResponse fetchCompanyProject(CompanyFilterRequest request,
			JwtAuthenticationToken jwtAuthenticationToken) {
		Long userSq = jwtAuthenticationToken.getUserSq();
		Long userTypeCd = jwtAuthenticationToken.getUserTypeCd();
		long companySq = companyService.fetchCompanySq(userSq, userTypeCd);

		Long totalCount = projectMapper.countCompanyProjectsBySearch(request, companySq);
		List<Project> projects = projectMapper.findProjectsByCompany(companySq, request);
		List<ProjectSummary> responses = new ArrayList<>();

		projects.forEach(p -> {
			String address = fetchAddressString(p.getAddressSq());
			String status = projectMapper.judgeProjectRecruitStatus(p.getProjectSq());

			// [추가] 기업 목록에서도 단가 가공 적용
			String formattedSalary = formatSalary(p.getProjectSalary());

			String hasScrapped = (scrapMapper.findScrapSqByUserSqAndProjectSq(userSq, p.getProjectSq()) != null)
					? "Y"
					: "N";

			String companyImageUrl = companyService.fetchCompanyImageUrl(p.getCompanySq());

			// [수정] 가공된 급여 포함
			responses.add(ProjectSummary.from(p, projectUtil, address, status, hasScrapped, companyImageUrl,
					formattedSalary));
		});

		int page = (request.getOffset() / request.getSize()) + 1;
		int totalPages = (int) Math.ceil((double) totalCount / request.getSize());

		return new ProjectListResponse(page, request.getSize(), totalCount, totalPages, responses);
	}

	// 프로젝트 조회수 증가 (게시판 addViewCntBoard와 동일 패턴)
	@Transactional
	public void addViewCntProject(Long projectSq) {
		projectMapper.updateViewCnt(projectSq);
	}

	@Transactional
	public ProjectRecruitStatus fetchCompanyProjectCount(CompanyFilterRequest request,
			JwtAuthenticationToken jwtAuthenticationToken) {

		Long userSq = jwtAuthenticationToken.getUserSq();
		Long userTypeCd = jwtAuthenticationToken.getUserTypeCd();

		Long companySq = companyService.fetchCompanySq(userSq, userTypeCd);

		return projectMapper.countCompanyProjectsByStatus(request, companySq);
	}

	// 조회수 증가는 incrementView API로 분리 — 상세 GET은 SEO용 서버 렌더링/크롤러 방문에도 쓰여
	// 여기서 올리면 페이지뷰당 중복 집계되고 봇 방문까지 집계된다.
	@Transactional
	public ProjectDetailResponse fetchProject(Long projectSq, JwtAuthenticationToken token) {
		Project p = projectMapper.findBySq(projectSq);

		if (p.getProjectIsDeletedYn().equals("Y")) {
			throw new RuntimeException("이미 삭제된 프로젝트 입니다.");
		}

		// 1. 단가 가공 (목록 조회와 동일하게 formatSalary 사용)
		String formattedSalary = formatSalary(p.getProjectSalary());

		// 2. 기업 이미지 URL만 가져오기
		String companyImageUrl = companyService.fetchCompanyImageUrl(p.getCompanySq());

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

			if (userTypeCd.equals(302L)) {
				Long companySq = companyService.fetchCompanySq(userSq, userTypeCd);
				hasApplied = projectApplicationMapper.findByProAndCom(projectSq, companySq) != null ? 1 : 0;
			} else {
				hasApplied = projectApplicationMapper.findByProAndUser(projectSq, userSq) != null ? 1 : 0;
			}
			userRole = findUserRole(token, p);
		}

		return ProjectDetailResponse.from(p, projectUtil, reqSkills, preferSkills, projectAddress, hasScrapped,
				hasApplied, userRole, companyImageUrl, formattedSalary);
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

	private void updateAddress(Project project, ProjectCreateRequest request) {
		// 1. 상세 주소 등록 (DB 체크 로직 포함)
		Long newAddressSq = handleDetailedAddressUpdate(project.getAddressSq(), request);
		// 2. 지하철 주소 등록 (DB 체크 로직 포함)
		Long newSubwaySq = handleSubwayAddressUpdate(project.getSubwayAddressSq(), request);

		// 3. 프로젝트 객체에 새로운 주소 PK 세팅 (address_type_cd 우선순위 자동 재설정 포함)
		// 이 값들이 세팅되어야 나중에 projectMapper.updateProject(project) 시 반영됩니다.
		project.updateAddressInfo(newAddressSq, newSubwaySq);
	}

	private Long handleDetailedAddressUpdate(Long existingAddressSq, ProjectCreateRequest request) {
		String reqAddress = request.detailedAddressName();
		// 1. 요청에 주소 없으면 기존 유지
		if (reqAddress == null || reqAddress.isBlank()) {
			return null;
		}
		// 2. 기존 주소 없으면 새로 생성
		if (existingAddressSq == null) {
			// [중요] 코드로 시군구 명칭을 조회하여 DTO에 채워주는 로직 호출
			return registerAddressWithDbCheck(request.detailedSigunguCode(), AddressInsertDto.forDetailed(request));
		}
		// 3. 기존 레코드 조회 후 비교. 기존 데이터가 일치하면 기존 주소 반환
		AddressInsertDto existing = addressMapper.findFullAddressBySq(existingAddressSq);
		if (isDetailedAddressUnchanged(existing, request)) {
			return existingAddressSq;
		}
		// 4. 변경되었으면 새 주소 생성
		AddressInsertDto newDto = AddressInsertDto.forDetailed(request);
		// 프론트에서 안 보내는 필드는 기존 레코드에서 복사
		if (newDto.getZonecode() == null) newDto.setZonecode(existing.getZonecode());
		if (newDto.getAreaCodeSq() == null) newDto.setAreaCodeSq(existing.getAreaCodeSq());
		if (newDto.getSigungu() == null) newDto.setSigungu(existing.getSigungu());
		if (newDto.getLatitude() == null) newDto.setLatitude(existing.getLatitude());
		if (newDto.getLongitude() == null) newDto.setLongitude(existing.getLongitude());
		addressMapper.createAddress(newDto);
		return newDto.getAddressSq();
	}

	private boolean isDetailedAddressUnchanged(AddressInsertDto existing, ProjectCreateRequest request) {
		return Objects.equals(existing.getAddress(), request.detailedAddressName())
				&& Objects.equals(existing.getDetailAddress(), request.detailedAddressDetail());
	}

	private Long handleSubwayAddressUpdate(Long existingSubwaySq, ProjectCreateRequest request) {
		String reqSubway = request.subwayAddressName();
		if (reqSubway == null || reqSubway.isBlank()) {
			return null;
		}
		if (existingSubwaySq == null) {
			// [중요] 지하철용 시군구 명칭 조회 및 세팅
			return registerAddressWithDbCheck(request.subwaySigunguCode(), AddressInsertDto.forSubway(request));
		}
		String existingSubway = addressMapper.findAddressBySq(existingSubwaySq);
		if (reqSubway.equals(existingSubway)) {
			return existingSubwaySq;
		}
		return registerAddressWithDbCheck(request.subwaySigunguCode(), AddressInsertDto.forSubway(request));
	}

	@Transactional
	public void updateProject(ProjectCreateRequest request) {
		Project project = projectMapper.findBySq(request.projectId());
		if (project.getProjectIsDeletedYn().equals("Y")) {
			throw new RuntimeException("이미 삭제된 프로젝트 입니다.");
		}

		long devGradeCodeSq = commonCodeMapper.findCommonCodeSqByName(request.devGrade(),
				ParentCodeEnum.DEVELOPER_GRADE.getCode());
		long educationLvlSq = commonCodeMapper.findCommonCodeSqByName(request.educationLvl(),
				ParentCodeEnum.EDUCATION.getCode());

		// 1. 객체 정보 업데이트 (메모리 상에서만 변경)
		project.update(request, devGradeCodeSq, educationLvlSq);

		// 2. 주소 및 하위 엔티티 업데이트 (여기서 주소 SQ들이 project 객체에 새로 세팅됨)
		updateSubEntities(project, request);

		// 3. 최종 저장 (중요! 주소까지 다 바뀐 최종 객체를 이때 DB에 딱 한 번만 쏜다)
		projectMapper.updateProject(project);
	}

	@Transactional
	public void updateSubEntities(Project project, ProjectCreateRequest request) {
		updateSkills(project, request);
		updateContracts(project, request);
		updateJobRoles(project, request);
		updateInterviewTimes(project, request);
		updateAddress(project, request);
	}

	@Transactional
	public void softDeleteProject(long projectSq, JwtAuthenticationToken token) {
		// 1. 프로젝트 조회
		Project project = projectMapper.findBySq(projectSq);
		if (project == null) {
			throw new RuntimeException("존재하지 않는 프로젝트입니다.");
		}

		// 2. 권한 체크 (추가된 메서드 호출)
		validateProjectOwner(project, token);

		// 3. 주소 데이터 분기 삭제 (Hard Delete)
		if (project.getAddressSq() != null) {
			projectMapper.deleteProjectAddress(project.getAddressSq());
		}
		if (project.getSubwayAddressSq() != null) {
			projectMapper.deleteProjectAddress(project.getSubwayAddressSq());
		}

		// 4. 프로젝트 본체 소프트 딜리트
		projectMapper.softDeleteProject(projectSq);
	}

	// 1. 권한 검증 헬퍼 메서드
	private void validateProjectOwner(Project project, JwtAuthenticationToken token) {
		long userSq = token.getUserSq();
		long userTypeCd = token.getUserTypeCd();

		// 기업 회원 전용 서비스이므로 기업 번호를 가져옴
		Long loginCompanySq = companyService.fetchCompanySq(userSq, userTypeCd);

		if (project.getCompanySq() == null || !project.getCompanySq().equals(loginCompanySq)) {
			// CustomException이 없다면 RuntimeException으로 대체 가능
			throw new RuntimeException("해당 프로젝트에 대한 권한이 없습니다.");
		}
	}

	@Transactional
	public void createProjectApplication(long projectSq, ProjectApplyRequest request, Long userSq) {
		if (projectMapper.isUserWithdrawn(userSq)) {
			throw new IllegalArgumentException("탈퇴한 회원은 프로젝트에 지원할 수 없습니다.");
		}

		Optional<Long> userCompanySq = Optional.ofNullable(companyService.fetchCompanySq(userSq));

		request.getResumeSq().forEach(rSq -> {
			ProjectApplicationEntity projectApplicationEntity = ProjectApplicationEntity.from(projectSq,
					projectMapper, rSq, request.getProjectApplicationTyp(), commonCodeMapper, userCompanySq);
			projectMapper.insertProjectApplication(projectApplicationEntity);
			projectMapper.increaseApplication(projectSq);
		});

		// ================= [ 알림 발송 추가 ] =================
		// 1. 프로젝트 등록자(기업 담당자)의 UserSq 조회
		Long companyUserSq = projectMapper.findUserSqByProjectSq(projectSq);

		// 2. 알림 발송 (등록자가 존재하고, 본인 프로젝트에 본인이 지원한 게 아닐 때)
		if (companyUserSq != null && !companyUserSq.equals(userSq)) {
			// 리퀘스트 타입에 따른 프론트엔드 파라미터 매핑
			// PERSONAL -> personal / COMPANY -> corporate
			String rawType = request.getProjectApplicationTyp();
			String appTyp = "personal";

			if ("COMPANY".equals(rawType)) {
				appTyp = "corporate";
			}
			// 프로젝트 제목 추후 추가 & 제목 조회 쿼리를 결합
			notificationService.send(
					companyUserSq,
					userSq,
					2602L, // 프로젝트 지원 결과 코드
					"새로운 프로젝트 지원자가 있습니다. 지원 현황을 확인해 주세요.",
					"/mypage/affiliationProjectList?projectSq=" + projectSq + "&appTyp=" + appTyp);
		}
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

	@Transactional
	public List<ContractInsertRequest> fillContractInsertRequest(Long projectSq, List<String> contracts) {
		List<ContractInsertRequest> requests = new ArrayList<>();
		contracts.forEach(contractName -> {
			ContractInsertRequest request = new ContractInsertRequest(projectSq,
					commonCodeMapper.findCommonCodeSqByName(contractName, ParentCodeEnum.CONTRACT_TYPE.getCode()));
			requests.add(request);
		});
		return requests;
	}

	@Transactional
	public List<JobInsertRequest> fillJobInsertRequest(Long projectSq, List<String> recruitJobs) {
		List<JobInsertRequest> requests = new ArrayList<>();
		recruitJobs.forEach(jobName -> {
			JobInsertRequest request = new JobInsertRequest(projectSq,
					commonCodeMapper.findCommonCodeSqByName(jobName, ParentCodeEnum.JOB_POSITION.getCode()));
			requests.add(request);
		});
		return requests;
	}

	@Transactional
	public ProjectFormDataResponse fetchProjectFormDatas(long projectSq) {
		List<GroupSkillInfoResponse> skills = groupingSkills(projectMapper.findSkillFormList());

		if (projectSq != 0L) {
			Project project = projectMapper.findBySq(projectSq);

			// 초기값 null 세팅
			AreaInfoResponse areaInfoResponse = null;
			AreaInfoResponse parentInfo = null;

			// [수정] 상세 주소(addressSq)가 있을 때만 DB 조회 실행
			if (project.getAddressSq() != null) {
				areaInfoResponse = fetchSubDistrictInfoByProjectSq(project.getAddressSq());
				if (areaInfoResponse != null) {
					parentInfo = fetchParentDistrictInfoByCd(areaInfoResponse.getAreaSq());
				}
			}

			// [수정] ExistProjectVo.from 호출 시 null이 넘어가도 에러 안 나게 처리됨
			ExistProjectVo existProjectVo = ExistProjectVo.from(
					project,
					projectUtil,
					skillMapper.findAllReqSkillsByProjectSq(projectSq),
					skillMapper.findAllPreferSkillsByProjectSq(projectSq).reversed(),
					parentInfo, // 상세 주소 없으면 null
					areaInfoResponse // 상세 주소 없으면 null
			);

			return ProjectFormDataResponse.from(commonCodeMapper, districtMapper, skills, existProjectVo);
		}

		return ProjectFormDataResponse.from(commonCodeMapper, districtMapper, skills);
	}

	@Transactional
	// fetch 해온 기술들을 상위 분류에 따라 분류.
	public List<GroupSkillInfoResponse> groupingSkills(List<SingleSkillInfoResponse> responses) {
		Map<String, List<String>> grouped = responses.stream()
				.collect(Collectors.groupingBy(
						SingleSkillInfoResponse::getParentSkillTagNm,
						LinkedHashMap::new,
						Collectors.mapping(SingleSkillInfoResponse::getChildSkillTagNm, Collectors.toList())));

		List<GroupSkillInfoResponse> result = grouped.entrySet().stream()
				.map(e -> new GroupSkillInfoResponse(e.getKey(), e.getValue()))
				.collect(Collectors.toList());

		return result;
	}

	@Transactional
	public List<AreaInfoResponse> fetchDistricts(Long areaCodeSq) {
		return districtMapper.findAllDistrictByParent(areaCodeSq);
	}

	@Transactional
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

	@Transactional
	public List<InterviewTimeInfoResponse> fetchProjectAvailableTimes(Long projectSq) {
		return projectMapper.findInterviewSqTmByProjectSq(projectSq);
	}

	@Transactional
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

	@Transactional
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

	@Transactional(readOnly = true)
	public List<ProjectRegionGroupDTO> fetchProjectRegionGroups(ProjectSearchRequest request) {
		// 쿼리에서 GROUP BY를 통해 시군구별 데이터 집계
		return projectMapper.findProjectGroupsByRegion(request);
	}

	// 단가 가공 로직 예시
	private String formatSalary(Long salary) {
		if (salary == null || salary == 0)
			return "단가 협의";
		return "월 " + (salary / 10000) + "만원";
	}

}
