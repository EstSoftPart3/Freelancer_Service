package com.example.demo.domain.mypage.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.example.demo.domain.mypage.dto.ApplicationPassDTO;
import com.example.demo.domain.mypage.repository.ApplicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    // 소속 합격 / 불합격 선택
    // [수정] 소속 합격 처리 로직
    public void processPass(ApplicationPassDTO dto) {
        if (Long.valueOf(502L).equals(dto.getCompanyApplicationStatusCd())) { // 502: 합격

            // 1. 수정된 쿼리를 통해 '현재 재직 중'인 이력이 있는지 확인
            boolean isWorkingNow = applicationRepository.isUserAlreadyAffiliated(dto.getUserSq());

            if (isWorkingNow) {
                // 현재 활성화된 소속이 있는 경우에만 입사를 차단합니다.
                throw new IllegalStateException("해당 지원자는 현재 다른 기업에 재직 중입니다.");
            }

            // 2. 새로운 소속 이력을 추가 (재입사자라면 새로운 행이 생성됨)
            applicationRepository.insertCompanyMember(dto);
        }
    }

    public ApplicationPassDTO findApplicationDetail(Long applicationSq) {
        ApplicationPassDTO applicationPassDTO = applicationRepository.findApplicationDetail(applicationSq);

        if (applicationPassDTO == null) {
            throw new IllegalStateException("해당 지원자 정보를 찾을 수 없습니다.");
        } else {
            return applicationPassDTO;
        }
    }
}
