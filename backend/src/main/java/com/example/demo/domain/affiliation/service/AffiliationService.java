package com.example.demo.domain.affiliation.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.affiliation.dto.request.SearchFilterRequest;
import com.example.demo.domain.mypage.dto.ApplicationPassDTO;
import com.example.demo.domain.affiliation.dto.response.AffiliationListResponse;
import com.example.demo.domain.affiliation.dto.response.AffiliationResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicantListResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicantResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicationListResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicationResponse;
import com.example.demo.domain.affiliation.dto.response.ApplyResponse;
import com.example.demo.domain.affiliation.dto.response.MyAffiliationInfoResponse;
import com.example.demo.domain.affiliation.entity.Address;
import com.example.demo.domain.affiliation.entity.AreaCd;
import com.example.demo.domain.affiliation.entity.Career;
import com.example.demo.domain.affiliation.entity.Company;
import com.example.demo.domain.affiliation.entity.CompanyApplication;
import com.example.demo.domain.affiliation.entity.ResumeSkillTag;
import com.example.demo.domain.affiliation.entity.Scrap;
import com.example.demo.domain.affiliation.mapper.AffiliationMapper;
import com.example.demo.domain.mypage.repository.ApplicationRepository;
import com.example.demo.domain.user.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AffiliationService {

	private final AffiliationMapper affiliationMapper;
	// private final AmazonS3 amazonS3;
	private final ApplicationRepository affiliationRepository;
	private final NotificationService notificationService;
	private final CommonCodeMapper commonCodeMapper;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	// 소속 신청 내역 하나 조회
	@Transactional
	public ApplyResponse getAffiliaion(Long userSq, Long applicationSq) {

		CompanyApplication application = getApply(applicationSq);
		if (application == null) {
			throw new IllegalArgumentException("등록된 소속 신청 정보가 없습니다.");
		}

		// 지원자 본인 또는 해당 소속(회사)의 담당자만 조회할 수 있다.
		boolean isApplicant = Objects.equals(userSq, application.getUserSq());
		boolean isCompanyOwner = !isApplicant
				&& Objects.equals(userSq, affiliationMapper.findCompanyOwnerUserSq(application.getCompanySq()));
		if (!isApplicant && !isCompanyOwner) {
			throw new IllegalArgumentException("소속 신청 내역을 조회할 권한이 없습니다.");
		}

		Company company = affiliationMapper.findCompany(application.getCompanySq());
		if (company == null) {
			// 신청은 남아 있는데 소속(회사) 행이 사라진 경우(고아 FK). 권한 검사는 이미 통과했으니
			// company.getCompanySq() 에서 NPE 로 500 내는 대신 명확한 404 를 준다.
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 소속입니다.");
		}
		String resumeTtl = affiliationMapper.findResumeTtl(application.getResumeSq());
		Long applicantCnt = affiliationMapper.findApplicantCnt(application.getCompanySq());

		ApplicationResponse responses = ApplicationResponse.fromEntity(company, resumeTtl, application, applicantCnt);

		Address address = affiliationMapper.findAddress(company.getAddressSq());
		List<String> tags = affiliationMapper.findTags(company.getCompanySq());
		AffiliationResponse affiliation = AffiliationResponse.fromEntity(company, address, tags, null, null, null,
				null);

		return ApplyResponse.builder().apply(responses).affiliation(affiliation).build();
	}

	// 소속 공고 전체 리스트 조회
	@Transactional
	public AffiliationListResponse getAllAffiliations(Long userSq, SearchFilterRequest searchFilter) {

		List<Company> affiliations = affiliationMapper.findAll(searchFilter.getSearchType(), searchFilter.getKeyword(),
				searchFilter.getSortType(), searchFilter.getAddressCd(), searchFilter.getPage(), searchFilter.getSize(),
				searchFilter.getOffset());
		Long totalElements = affiliationMapper.findAllCnt(searchFilter);

		List<AffiliationResponse> companies = affiliations.stream()
				.filter(Objects::nonNull)
				.map(company -> {
					Address address = affiliationMapper.findAddress(company.getAddressSq());
					List<String> tags = affiliationMapper.findTags(company.getCompanySq());
					Long scrapCnt = affiliationMapper.findScrapCnt(company.getCompanySq());
					String imgNm = affiliationMapper.findProfileImg(company.getCompanySq());
					// S3용
					// String imageUrl = (imgNm != null) ? amazonS3.getUrl(bucket, imgNm).toString()
					// : null;
					String imageUrl = (imgNm != null) ? "/api/files/" + imgNm : null;
					Long applyCnt = affiliationMapper.findIsApply(userSq, company.getCompanySq());
					Long activeMember = (userSq != null)
							? affiliationMapper.isActiveMember(userSq, company.getCompanySq())
							: 0L;
					Boolean isApply = false;
					if (applyCnt > 0 || activeMember > 0) {
						isApply = true;
					}

					Boolean isScrap = false;
					if (userSq != null) {
						Scrap scrap = affiliationMapper.findScrap(userSq, company.getCompanySq());
						if (scrap != null) {
							isScrap = true;
						}
					}

					return AffiliationResponse.fromEntity(company, address, tags, scrapCnt, isScrap, isApply, imageUrl);

				}).collect(Collectors.toList());

		return AffiliationListResponse.builder().page(searchFilter.getPage()).size(searchFilter.getSize())
				.totalElements(totalElements).viewerSq(userSq).companies(companies).build();
	}

	// 소속 공고 스크랩
	@Transactional
	public void updateCompanyRecommend(Long userSq, Long companySq) {

		if (userSq == null) {
			throw new IllegalArgumentException("로그인 후 이용해주세요.");
		}

		Scrap scrap = affiliationMapper.findScrap(userSq, companySq);

		if (scrap == null) {
			scrap = Scrap.builder().userSq(userSq).companySq(companySq).scrapTypeCd(602L).build();
			affiliationMapper.insertScrap(scrap);

		} else {
			affiliationMapper.deleteScrap(scrap.getScrapSq());
		}

		return;
	}

	// 소속 조회수 증가
	public void addCompanyViewCnt(Long companySq) {
		affiliationMapper.addViewCnt(companySq);
		return;
	}

	// 소속 신청
	@Transactional
	public void addApply(CompanyApplication companyApplication) {
		if (companyApplication.getUserSq() == null) {
			throw new IllegalArgumentException("사용자 정보가 없습니다.");
		}

		Long isApply = affiliationMapper.findIsApply(companyApplication.getUserSq(), companyApplication.getCompanySq());
		if (isApply > 0) {
			throw new IllegalArgumentException("이미 신청한 공고입니다.");
		}

		Long activeMember = affiliationMapper.isActiveMember(companyApplication.getUserSq(),
				companyApplication.getCompanySq());
		if (activeMember > 0) {
			throw new IllegalArgumentException("이미 소속 중인 기업입니다.");
		}

		// 1. 소속 신청 저장
		affiliationMapper.insertApplication(companyApplication);

		// 2. [알림] 기업 담당자에게 발송
		Long companyOwnerSq = affiliationMapper.findCompanyOwnerUserSq(companyApplication.getCompanySq());
		if (companyOwnerSq != null) {
			notificationService.send(
					companyOwnerSq,
					companyApplication.getUserSq(), // 발신자: 지원자
					2603L, // 소속 지원 결과 카테고리 코드 (2603)
					"우리 소속에 새로운 가입 신청이 도착했습니다.",
					"/mypage/affiliationApplicantList");
		}
	}

	// 내 소속 정보 조회
	public MyAffiliationInfoResponse getMyAffiliationInfo(Long userSq) {
		Map<String, Object> map = affiliationMapper.findMyAffiliationInfo(userSq);
		if (map == null) {
			throw new IllegalArgumentException("현재 소속된 기업이 없습니다.");
		}

		Long companySq = ((Number) map.get("companySq")).longValue();
		String imgNm = affiliationMapper.findProfileImg(companySq);
		String imageUrl = (imgNm != null) ? "/api/files/" + imgNm : null;

		return MyAffiliationInfoResponse.fromMap(map, imageUrl);
	}

	// 소속 탈퇴
	@Transactional
	public void leaveAffiliation(Long userSq) {
		// 1. 개인이 소속된 companySq 조회
		Long companySq = affiliationMapper.findMemberCompanySq(userSq);
		if (companySq == null) {
			throw new IllegalArgumentException("현재 소속된 기업이 없습니다.");
		}

		// 2. 퇴사 상태 코드 조회 (402)
		Long resignedStatusCd = commonCodeMapper.findCommonCodeSqByName("퇴사", ParentCodeEnum.EMPLOYMENT.getCode());

		// 3. 멤버 상태를 퇴사로 변경
		affiliationMapper.updateMemberToResigned(companySq, userSq, resignedStatusCd, LocalDate.now());

		// 4. 기업 담당자에게 알림 발송
		Long companyOwnerSq = affiliationMapper.findCompanyOwnerUserSq(companySq);
		if (companyOwnerSq != null) {
			String userNm = affiliationMapper.findUserNmByUserSq(userSq);
			notificationService.send(
					companyOwnerSq,
					userSq,
					2603L,
					"[" + userNm + "]님이 소속을 탈퇴하였습니다.",
					"/mypage/affiliatedMembers");
		}
	}

	// 소속 신청 내용 수정
	public void updateApply(CompanyApplication companyApplication) {
		CompanyApplication application = affiliationMapper
				.findApplication(companyApplication.getCompanyApplicationSq());
		if (application == null) {
			throw new IllegalArgumentException("등록된 소속 신청 정보가 없습니다.");
		}

		// if (companyApplication.getUserSq() != application.getUserSq()) {
		// throw new IllegalArgumentException("사용자 정보가 일치하지 않습니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(companyApplication.getUserSq(), application.getUserSq())) {
			throw new IllegalArgumentException("사용자 정보가 일치하지 않습니다.");
		}

		if (companyApplication.getCompanyApplicationGreetingTxt() != null) {
			application.setCompanyApplicationGreetingTxt(companyApplication.getCompanyApplicationGreetingTxt());
		}

		if (companyApplication.getResumeSq() != null) {
			application.setResumeSq(companyApplication.getResumeSq());
		}

		affiliationMapper.updateApplication(application);
		return;
	}

	// 소속 신청 내역 상세 조회
	public CompanyApplication getApply(Long companyApplicationSq) {
		return affiliationMapper.findApplication(companyApplicationSq);
	}

	// 회사별 소속 공고 지원자 내용 전체 조회
	public ApplicantListResponse getAppliesByCompanySq(Long userSq, String searchType, String keyword, String readType,
			Long page, Long size) {
		if (page < 1)
			page = 1L;
		Long offset = (page - 1L) * size;
		Long totalElements = affiliationMapper.findApplicantsCnt(userSq, searchType, keyword);
		Long readElements = affiliationMapper.findApplicantsReadCnt(userSq, searchType, keyword);
		List<CompanyApplication> applications = affiliationMapper.findApplicants(userSq, searchType, keyword, readType,
				page, size, offset);
		List<ApplicantResponse> applicantResponses = applications.stream()
				.filter(Objects::nonNull)
				.map(application -> {
					List<Career> careers = affiliationMapper.findCareers(application.getResumeSq());
					String userNm = affiliationMapper.findUserNm(application.getResumeSq());
					List<ResumeSkillTag> skillTags = affiliationMapper.findResumeSkills(application.getResumeSq());

					return ApplicantResponse.fromEntity(userNm, careers, application, skillTags);

				}).collect(Collectors.toList());

		return ApplicantListResponse.builder().page(page).size(size).totalElements(totalElements)
				.readElements(readElements).applicants(applicantResponses).build();
	}

	// 합격 또는 불합격 변경
	@Transactional
	public void updateApplicationStatus(Long userSq, Long companyApplicationSq, Long companyApplicationStatusCd) {
		// 1. 상태 업데이트
		CompanyApplication application = getApply(companyApplicationSq);
		if (application == null) {
			throw new IllegalArgumentException("등록된 소속 신청 정보가 없습니다.");
		}
		// 해당 소속(회사)의 담당자만 합격/불합격을 결정할 수 있다.
		// (없으면 지원자 본인이 자기 신청의 상태를 502(합격)로 바꿔 스스로 소속될 수 있다)
		Long companyOwnerSq = affiliationMapper.findCompanyOwnerUserSq(application.getCompanySq());
		if (!Objects.equals(userSq, companyOwnerSq)) {
			throw new IllegalArgumentException("해당 소속 신청의 상태를 변경할 권한이 없습니다.");
		}
		if (companyApplicationStatusCd == null) {
			// 이전엔 요청에서 이 값이 빠지면 NPE(500)로 끊겼다. Objects.equals 로 NPE는 없앴지만,
			// 그대로 두면 null 이 DB 에 그대로 쓰이고(매퍼가 <if> 가드 없이 SET 한다) 아래 분기가
			// "불합격" 으로 빠져 실제로는 상태 미확정인데 지원자에게 불합격 통보가 나간다.
			throw new IllegalArgumentException("합격/불합격 상태 코드가 필요합니다.");
		}
		application.setCompanyApplicationStatusCd(companyApplicationStatusCd);
		affiliationMapper.updateApplication(application);

		// 2. [알림] 지원자(개인)에게 발송
		Map<String, Object> info = affiliationMapper.findAffiliationNotificationInfo(companyApplicationSq);
		if (info != null) {
			Long receiverSq = (Long) info.get("userSq");
			String companyNm = (String) info.get("companyNm");
			String message = "";

			// 상태 코드에 따른 메시지 분기 (예: 702 합격, 703 불합격 등 실제 코드에 맞춰 수정)
			// 요청 본문에 companyApplicationStatusCd 가 빠지면 null 이 그대로 들어오므로
			// .equals() 대신 Objects.equals() 로 NPE 없이 걸러낸다.
			if (Objects.equals(companyApplicationStatusCd, 502L)) {
				// 합격 시 이미 다른 기업에 소속 중이면 상태 변경 롤백 + 알림 차단
				boolean isWorkingNow = affiliationRepository.isUserAlreadyAffiliated(receiverSq);
				if (isWorkingNow) {
					throw new IllegalStateException("해당 지원자는 현재 다른 기업에 재직 중입니다.");
				}

				// 3. 합격 시 소속 멤버 등록 (같은 트랜잭션 내에서 처리)
				ApplicationPassDTO passDTO = affiliationRepository.findApplicationDetail(companyApplicationSq);
				if (passDTO == null) {
					throw new IllegalStateException("지원 정보를 찾을 수 없습니다.");
				}
				// 바로 위 isUserAlreadyAffiliated 확인과 이 INSERT 사이엔 잠금이 없어, 서로 다른
				// 두 회사가 같은 지원자를 거의 동시에 승인하면 둘 다 확인을 통과할 수 있었다.
				// 진짜 방어선은 TBL_COMPANY_MEMBER_R 의 유니크 인덱스다(재직 중인 소속은
				// 사용자당 하나만 허용, 2026-09-10 migrate-2026-09-10-affiliation-unique-member.py
				// 로 추가) — 경합이 나면 나중 INSERT 가 여기서 걸린다.
				try {
					affiliationRepository.insertCompanyMember(passDTO);
				} catch (DuplicateKeyException e) {
					throw new IllegalStateException("해당 지원자는 현재 다른 기업에 재직 중입니다.");
				}

				message = "축하합니다! [" + companyNm + "] 소속 가입 신청이 승인되었습니다.";
			} else {
				message = "아쉽게도 [" + companyNm + "] 소속 가입 신청 결과가 발표되었습니다. (불합격)";
			}

			notificationService.send(
					receiverSq,
					null,
					2603L, // 소속 지원 결과 카테고리 코드 (2603)
					message,
					"/mypage/affiliatedJobApplications");
		}
	}

	// 회원별 소속 신청 내용 전체 조회
	public ApplicationListResponse getAppliesByUserSq(Long userSq, String searchType, String keyword, String readType,
			Long page, Long size) {
		if (page < 1)
			page = 1L;
		Long offset = (page - 1L) * size;
		Long totalElements = affiliationMapper.findApplicationByUserSqCnt(userSq, searchType, keyword);
		Long readElements = affiliationMapper.findApplicationByUserSqReadCnt(userSq, searchType, keyword);
		List<CompanyApplication> applications = affiliationMapper.findApplicationByUserSq(userSq, searchType, keyword,
				readType, page, size, offset);
		List<ApplicationResponse> responses = applications.stream()
				.filter(Objects::nonNull)
				.map(application -> {
					Company company = affiliationMapper.findCompany(application.getCompanySq());
					if (company == null) {
						// getAffiliaion 과 같은 고아 FK 케이스(신청은 남아 있는데 소속 행이 사라짐).
						// 여기는 목록이라 전체를 500 으로 죽이는 대신 그 항목만 건너뛴다.
						return null;
					}
					String resumeTtl = affiliationMapper.findResumeTtl(application.getResumeSq());
					Long applicantCnt = affiliationMapper.findApplicantCnt(application.getCompanySq());

					return ApplicationResponse.fromEntity(company, resumeTtl, application, applicantCnt);

				}).filter(Objects::nonNull).collect(Collectors.toList());

		return ApplicationListResponse.builder().applies(responses).size(size).page(page).totalElements(totalElements)
				.readElements(readElements).build();
	}

	// 열람 상태 변경
	public void updateApplicationReadAt(Long userSq, Long companyApplicationSq) {
		CompanyApplication application = getApply(companyApplicationSq);
		if (application == null) {
			throw new IllegalArgumentException("등록된 소속 신청 정보가 없습니다.");
		}
		// 해당 소속(회사)의 담당자만 열람 처리를 할 수 있다.
		Long companyOwnerSq = affiliationMapper.findCompanyOwnerUserSq(application.getCompanySq());
		if (!Objects.equals(userSq, companyOwnerSq)) {
			throw new IllegalArgumentException("해당 소속 신청을 열람할 권한이 없습니다.");
		}
		if (application.getCompanyApplicationReadAtDtm() == null) {
			affiliationMapper.updateReadAt(companyApplicationSq);
		}
		return;
	}

	// 소속 신청 취소
	public void deleteApplication(Long userSq, Long companyApplicationSq) {
		CompanyApplication application = getApply(companyApplicationSq);
		if (application == null) {
			throw new IllegalArgumentException("등록된 소속 신청 정보가 없습니다.");
		}
		// 본인이 신청한 소속 신청만 취소할 수 있다.
		if (!Objects.equals(userSq, application.getUserSq())) {
			throw new IllegalArgumentException("본인의 소속 신청만 취소할 수 있습니다.");
		}
		affiliationMapper.deleteApplication(companyApplicationSq);
		return;
	}

	// 주소 리스트 조회
	public List<AreaCd> getAddressList() {
		return affiliationMapper.findAddressCds();
	}

	// 스크랩 리스트 조회
	public AffiliationListResponse getScraps(Long userSq, String searchType, String keyword, Long page, Long size) {
		if (page < 1)
			page = 1L;
		Long offset = (page - 1L) * size;
		List<Company> companies = affiliationMapper.findScrapAffiliations(userSq, searchType, keyword, page, size,
				offset);
		Long totalElements = affiliationMapper.findScrapAffiliationsCnt(userSq, searchType, keyword);

		List<AffiliationResponse> affiliations = companies.stream()
				.filter(Objects::nonNull)
				.map(company -> {
					Address address = affiliationMapper.findAddress(company.getAddressSq());
					List<String> tags = affiliationMapper.findTags(company.getCompanySq());
					Long memberCnt = affiliationMapper.findAffiliationMemberCnt(company.getCompanySq());

					Long applyCnt = affiliationMapper.findIsApply(userSq, company.getCompanySq());
					Boolean isApply = false;
					if (applyCnt > 0) {
						isApply = true;
					}

					return AffiliationResponse.fromEntityScrap(company, address, tags, memberCnt, isApply);

				}).collect(Collectors.toList());

		return AffiliationListResponse.builder().totalElements(totalElements).page(page).size(size)
				.companies(affiliations).viewerSq(userSq).build();
	}

}
