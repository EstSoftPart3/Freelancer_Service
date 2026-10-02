package com.example.demo.domain.mypage.service;

import java.time.LocalDate;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.affiliation.mapper.AffiliationMapper;
import com.example.demo.domain.company.mapper.CompanyMapper;
import com.example.demo.domain.user.service.NotificationService;
import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.dto.request.UserWithdrawRequestDTO;
import com.example.demo.domain.mypage.repository.WithdrawRepository;
import com.example.demo.domain.project.service.ProjectApplicationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WithdrawService {
    private final WithdrawRepository withdrawRepository;
    private final AffiliationMapper affiliationMapper;
    private final CommonCodeMapper commonCodeMapper;
    private final ProjectApplicationService projectApplicationService;
    private final CompanyMapper companyMapper;
    private final NotificationService notificationService;

    @Transactional
    public void withdraw(Long userSq, UserWithdrawRequestDTO dto) {
        UserInfoDTO user = withdrawRepository.getUser(userSq);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 이름이 비어 있는 계정(소셜 가입 등)에서 NPE 500 이 나지 않게 null 안전 비교를 쓴다.
        if (!Objects.equals(user.getUserId(), dto.getUserId()) || !Objects.equals(user.getUserNm(), dto.getUserNm())) {
            throw new IllegalArgumentException("요청 정보가 일치하지 않습니다.");
        }

        int updated = withdrawRepository.withdraw(userSq);
        if (updated == 0) {
            throw new IllegalArgumentException("탈퇴 처리에 실패했습니다.");
        }

        // 탈퇴 시 활성 소속(TBL_COMPANY_MEMBER_R)이 남아있으면 함께 퇴사 처리한다.
        // 그렇지 않으면 탈퇴한 회원이 기업 소속 인원 목록에 계속 노출되고 프로젝트 지원도 가능해진다.
        Long companySq = affiliationMapper.findMemberCompanySq(userSq);
        if (companySq != null) {
            Long resignedStatusCd = commonCodeMapper.findCommonCodeSqByName("퇴사", ParentCodeEnum.EMPLOYMENT.getCode());
            if (resignedStatusCd == null) {
                // 코드를 못 찾으면 status 컬럼에 NULL 을 써 넣어 소속 상태가 망가진다. 차라리 탈퇴 전체를 롤백한다.
                throw new IllegalStateException("퇴사 상태 코드를 찾을 수 없습니다.");
            }
            affiliationMapper.updateMemberToResigned(companySq, userSq, resignedStatusCd, LocalDate.now());
            projectApplicationService.cancelCorporateApplicationsOnLeave(userSq, companySq);
        }

        // 기업 회원이면 회사를 닫는다(§10 A20) — 회사는 담당자 계정 하나에 묶여 있어, 남겨 두면 처리할 사람 없이
        // 공고·파트너 목록에 계속 보이며 지원·소속 신청을 받는다. 행은 지우지 않고 상태만 바꿔 기록은 남긴다.
        Long ownCompanySq = companyMapper.findCompanySqByUserSq(userSq);
        if (ownCompanySq != null) {
            closeCompany(ownCompanySq);
        }
    }

    private void closeCompany(Long companySq) {
        projectApplicationService.closeCompanyProjectsOnWithdraw(companySq);

        Long resignedStatusCd = commonCodeMapper.findCommonCodeSqByName("퇴사", ParentCodeEnum.EMPLOYMENT.getCode());
        if (resignedStatusCd == null) {
            throw new IllegalStateException("퇴사 상태 코드를 찾을 수 없습니다.");
        }
        String companyNm = companyMapper.findCompanyNmByCompanySq(companySq);
        for (Long memberSq : affiliationMapper.findActiveMemberUserSqs(companySq)) {
            affiliationMapper.updateMemberToResigned(companySq, memberSq, resignedStatusCd, LocalDate.now());
            projectApplicationService.cancelCorporateApplicationsOnLeave(memberSq, companySq);
            notificationService.send(memberSq, null, 2603L,
                    "[" + companyNm + "] 기업이 탈퇴하여 소속이 종료되었습니다.", "/mypage/affiliated-info");
        }

        for (Long applicantSq : affiliationMapper.findPendingApplicantUserSqs(companySq)) {
            notificationService.send(applicantSq, null, 2603L,
                    "[" + companyNm + "] 기업이 탈퇴하여 소속 신청이 종료되었습니다.", "/mypage/affiliated-info");
        }
        affiliationMapper.rejectPendingApplications(companySq);
        affiliationMapper.stopRecruiting(companySq);
    }
}
