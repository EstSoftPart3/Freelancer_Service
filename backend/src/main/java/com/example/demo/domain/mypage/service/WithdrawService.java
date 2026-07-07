package com.example.demo.domain.mypage.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.affiliation.mapper.AffiliationMapper;
import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.dto.request.UserWithdrawRequestDTO;
import com.example.demo.domain.mypage.repository.WithdrawRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WithdrawService {
    private final WithdrawRepository withdrawRepository;
    private final AffiliationMapper affiliationMapper;
    private final CommonCodeMapper commonCodeMapper;

    @Transactional
    public void withdraw(Long userSq, UserWithdrawRequestDTO dto) {
        UserInfoDTO user = withdrawRepository.getUser(userSq);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        if (!user.getUserId().equals(dto.getUserId()) || !user.getUserNm().equals(dto.getUserNm())) {
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
            affiliationMapper.updateMemberToResigned(companySq, userSq, resignedStatusCd, LocalDate.now());
        }
    }
}
