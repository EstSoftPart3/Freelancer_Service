package com.example.demo.domain.company.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.company.dto.CompanyMemberVo;
import com.example.demo.domain.company.dto.request.CompanyMemberSearchRequest;
import com.example.demo.domain.company.dto.request.CompanyStatusRequest;
import com.example.demo.domain.company.dto.response.CompanyMemberResponse;
import com.example.demo.domain.company.mapper.CompanyMapper;
import com.example.demo.domain.mypage.mapper.ResumeCareerMapper;
import com.example.demo.domain.mypage.mapper.ResumeMapper;
import com.example.demo.domain.mypage.mapper.ResumeSkillMapper;
import com.example.demo.domain.project.vo.ResumeSummaryVo;
import com.example.demo.domain.user.service.NotificationService;
import com.example.demo.domain.user.util.JwtAuthenticationToken;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyService {
	private final CompanyMapper companyMapper;
	private final CommonCodeMapper commonCodeMapper;
	private final NotificationService notificationService;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	// @Value("${cloud.aws.region.static}")
	// private String region;

	private final ResumeMapper resumeMapper;
	private final ResumeCareerMapper resumeCareerMapper;
	private final ResumeSkillMapper resumeSkillMapper;

	public Long fetchCompanySq(Long userSq) {
		return companyMapper.findCompanySqByUserSq(userSq);
	}

	public Long fetchCompanySq(Long userSq, Long userTypeCd) {
		if (userTypeCd
				.equals(commonCodeMapper.findCommonCodeSqByEngName("COMPANY", ParentCodeEnum.MEMBER_TYPE.getCode()))) {
			return companyMapper.findCompanySqByUserSq(userSq);
		} else {
			throw new RuntimeException("접근 권한이 없습니다.");
		}
	}

	public Long fetchUserSq(Long companySq) {
		return companyMapper.findUserSqByCompanySq(companySq);
	}

	public String fetchCompanyBizNumByUser(Long userSq) {
		return companyMapper.findBizNumByUserSq(userSq);
	}

	public String fetchCompanyBizNumByCompany(Long companySq) {
		return companyMapper.findBizNumByCompanySq(companySq);
	}

	public String fetchCompanyImageUrl(Long companySq) {
		String fileName = companyMapper.findCompanyImageUrlBySq(companySq);
		if (fileName == null) {
			return null;
		}
		return "/api/files/" + fileName; // 로컬용
	}

	@Transactional
	public CompanyMemberResponse fetchMemberList(JwtAuthenticationToken token, CompanyMemberSearchRequest request) {
		Long companySq = fetchCompanySq(token.getUserSq(), token.getUserTypeCd());

		Long totalCount = companyMapper.countUsersBySearch(companySq, request);

		List<Long> companyUserSqs = companyMapper.findUserSqsByCompanySqAndSearch(companySq, request);
		List<CompanyMemberVo> responses = new ArrayList<>();

		companyUserSqs.forEach(
				sq -> {
					ResumeSummaryVo resumeSummaryVo;
					Long repResumeSq = resumeMapper.findRepResumeByUserSq(sq);
					if (repResumeSq == null) {
						repResumeSq = resumeMapper.findLatestResumeSqByUserSq(sq);
						resumeSummaryVo = resumeMapper.findLatestResumeBySq(repResumeSq);

					} else {

						resumeSummaryVo = resumeMapper.findRepResumeNmTtlByUserSq(sq);

					}
					// List<Long> resumeSqs = resumeMapper.findResumesByUserSq(sq);

					LocalDate joinDt = companyMapper.findCompanyJoinDt(sq, companySq);
					LocalDate leaveDt = companyMapper.findCompanyLeaveDt(sq, companySq);
					Long leavedYn = companyMapper.findCompanyMemberStatus(sq, companySq);

					Integer careerYr = calculateTotalCareer(repResumeSq);
					List<String> skillTags = resumeSkillMapper.findAllNmBySq(repResumeSq);

					responses.add(
							CompanyMemberVo.from(sq, resumeSummaryVo, joinDt, leaveDt, skillTags, careerYr, leavedYn));

				});
		int page = (request.getOffset() / request.getSize()) + 1;
		int totalPages = (int) Math.ceil((double) totalCount / request.getSize());

		return new CompanyMemberResponse(page, request.getSize(), totalCount, totalPages, responses);
	}

	@Transactional
	public void updateMemberStatus(JwtAuthenticationToken token, CompanyStatusRequest request) {
		// 1. 토큰 정보를 기반으로 로그인한 유저의 진짜 기업 번호(companySq)를 조회합니다. (보안 핵심)
		Long realCompanySq = fetchCompanySq(token.getUserSq(), token.getUserTypeCd());

		// 2. '퇴사'에 해당하는 공통 코드 SQ를 가져옵니다 (예: 402)
		Long memberStatusCd = commonCodeMapper.findCommonCodeSqByName(request.getNewStatus(),
				ParentCodeEnum.EMPLOYMENT.getCode());

		if ("퇴사".equals(request.getNewStatus())) {
			// 3. 검증된 realCompanySq를 사용하여 해당 기업의 멤버만 퇴사 처리합니다.
			companyMapper.updateMemberToResigned(realCompanySq, request.getUserSq(), memberStatusCd, LocalDate.now());

			// 4. [알림] 퇴사 처리된 개인에게 알림 발송
			String companyNm = companyMapper.findCompanyNmByCompanySq(realCompanySq);
			notificationService.send(
					request.getUserSq(),
					token.getUserSq(),
					2603L,
					"[" + companyNm + "] 소속에서 퇴사 처리되었습니다.",
					"/mypage");
		} else {
			companyMapper.updateMemberStatus(realCompanySq, request.getUserSq(), memberStatusCd);
		}
	}

	public Integer calculateTotalCareer(Long repResumeSq) {
		AtomicInteger totalCareer = new AtomicInteger(0);

		Integer career = resumeCareerMapper.calculateCareerByResSq(repResumeSq);

		if (career == null) {
			System.out.println("🚨 null 반환된 resumeSq: " + repResumeSq);
		} else {
			System.out.println("✅ resumeSq " + repResumeSq + " 의 경력연차: " + career);
		}

		totalCareer.addAndGet(career != null ? career : 0);

		return totalCareer.get();
	}
}
