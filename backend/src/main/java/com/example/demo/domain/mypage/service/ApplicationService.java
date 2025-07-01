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
    public void processPass(ApplicationPassDTO dto) {
        if (dto.getCompanyApplicationStatusCd() == 502L) {
            boolean alreadyAffiliated = applicationRepository.isUserAlreadyAffiliated(dto.getUserSq());
            if (alreadyAffiliated) {
                throw new IllegalStateException("해당 지원자는 이미 다른 기업에 소속되어 있습니다.");
            }

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
