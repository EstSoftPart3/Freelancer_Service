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

        // 입력 정보 검증
        if (!user.getUserId().equals(dto.getUserId()) || !user.getUserNm().equals(dto.getUserNm())) {
            throw new IllegalArgumentException("요청 정보가 일치하지 않습니다.");
        }
        
        // 💡 이제 이메일을 가공하는 복잡한 if문이 필요 없습니다.
        // DB 쿼리에서 모든 유저의 이메일을 변조하도록 설정했기 때문입니다.
        // 이렇게 해야 소셜 유저의 재가입 이메일 충돌을 완벽히 방지할 수 있습니다.

        int updated = withdrawRepository.withdraw(userSq); // 파라미터는 userSq만 전달
        if (updated == 0) {
            throw new IllegalArgumentException("탈퇴 처리에 실패했습니다.");
        }
    }
}
