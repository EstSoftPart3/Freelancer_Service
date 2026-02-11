package com.example.demo.domain.affiliation.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.affiliation.dto.request.SearchFilterRequest;
import com.example.demo.domain.affiliation.dto.response.AffiliationListResponse;
import com.example.demo.domain.affiliation.dto.response.AffiliationResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicantListResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicantResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicationListResponse;
import com.example.demo.domain.affiliation.dto.response.ApplicationResponse;
import com.example.demo.domain.affiliation.dto.response.ApplyResponse;
import com.example.demo.domain.affiliation.entity.Address;
import com.example.demo.domain.affiliation.entity.AreaCd;
import com.example.demo.domain.affiliation.entity.Career;
import com.example.demo.domain.affiliation.entity.Company;
import com.example.demo.domain.affiliation.entity.CompanyApplication;
import com.example.demo.domain.affiliation.entity.ResumeSkillTag;
import com.example.demo.domain.affiliation.entity.Scrap;
import com.example.demo.domain.affiliation.mapper.AffiliationMapper;
import com.example.demo.domain.mypage.repository.ApplicationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AffiliationService {

	private final AffiliationMapper affiliationMapper;
	// private final AmazonS3 amazonS3;
	private final ApplicationRepository affiliationRepository;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	// 소속 신청 내역 하나 조회
	@Transactional
	public ApplyResponse getAffiliaion(Long applicationSq) {

		CompanyApplication application = getApply(applicationSq);

		Company company = affiliationMapper.findCompany(application.getCompanySq());
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
					// 로컬용
					String imageUrl = (imgNm != null) ? "/api//files/" + imgNm : null;
					// CasoOS용
					// String imageUrl = (imgNm != null) ? "/files/" + imgNm : null;
					Long applyCnt = affiliationMapper.findIsApply(userSq, company.getCompanySq());
					Boolean isApply = false;
					if (applyCnt > 0) {
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
	public void addApply(CompanyApplication companyApplication) {
		if (companyApplication.getUserSq() == null) {
			throw new IllegalArgumentException("사용자 정보가 없습니다.");
		}

		Long isApply = affiliationMapper.findIsApply(companyApplication.getUserSq(), companyApplication.getCompanySq());

		if (isApply > 0) {
			throw new IllegalArgumentException("이미 신청한 공고입니다.");
		}

		affiliationMapper.insertApplication(companyApplication);
		return;
	}

	// 소속 신청 내용 수정
	public void updateApply(CompanyApplication companyApplication) {
		CompanyApplication application = affiliationMapper
				.findApplication(companyApplication.getCompanyApplicationSq());
		if (application == null) {
			throw new IllegalArgumentException("등록된 소속 신청 정보가 없습니다.");
		}

		if (companyApplication.getUserSq() != application.getUserSq()) {
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
	public void updateApplicationStatus(Long companyApplicationSq, Long companyApplicationStatusCd) {
		CompanyApplication application = getApply(companyApplicationSq);
		application.setCompanyApplicationStatusCd(companyApplicationStatusCd);

		affiliationMapper.updateApplication(application);
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
					String resumeTtl = affiliationMapper.findResumeTtl(application.getResumeSq());
					Long applicantCnt = affiliationMapper.findApplicantCnt(application.getCompanySq());

					return ApplicationResponse.fromEntity(company, resumeTtl, application, applicantCnt);

				}).collect(Collectors.toList());

		return ApplicationListResponse.builder().applies(responses).size(size).page(page).totalElements(totalElements)
				.readElements(readElements).build();
	}

	// 열람 상태 변경
	public void updateApplicationReadAt(Long companyApplicationSq) {
		CompanyApplication application = getApply(companyApplicationSq);
		if (application.getCompanyApplicationReadAtDtm() == null) {
			affiliationMapper.updateReadAt(companyApplicationSq);
		}
		return;
	}

	// 소속 신청 취소
	public void deleteApplication(Long companyApplicationSq) {
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
