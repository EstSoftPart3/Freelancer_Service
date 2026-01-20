package com.example.demo.domain.mypage.service;

import org.springframework.stereotype.Service;

import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.dto.request.UserWithdrawRequestDTO;
import com.example.demo.domain.mypage.repository.WithdrawRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WithdrawService {
    private final WithdrawRepository withdrawRepository;

    public void withdraw(Long userSq, UserWithdrawRequestDTO dto) {
        UserInfoDTO user = withdrawRepository.getUser(userSq);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        if (!user.getUserId().equals(dto.getUserId()) || !user.getUserNm().equals(dto.getUserNm())) {
            throw new IllegalArgumentException("요청 정보가 일치하지 않습니다.");
        }
        
        String emailToUpdate = user.getUserEmail(); // 기본은 기존 이메일 유지

        // 💡 아이디가 S_로 시작하거나 가입 타입이 203(소셜)인 경우만 꼬리표 붙이기
        if (user.getUserId().startsWith("S_") || "203".equals(user.getUserSignupTypeCd())) {
            emailToUpdate = user.getUserEmail() + "_DEL_" + System.currentTimeMillis();
        }

        // 최종 결정된 emailToUpdate를 넘김
        int updated = withdrawRepository.withdraw(userSq, emailToUpdate);
        if (updated == 0) {
            throw new IllegalArgumentException("탈퇴 처리에 실패했습니다.");
        }
    }
}
