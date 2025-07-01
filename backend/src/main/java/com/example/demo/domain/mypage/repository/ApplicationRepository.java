package com.example.demo.domain.mypage.repository;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.ApplicationPassDTO;
import com.example.demo.domain.mypage.mapper.ApplicationMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ApplicationRepository {

    private final ApplicationMapper applicationMapper;

    public boolean isUserAlreadyAffiliated(Long userSq) {
        return applicationMapper.existsCompanyAffiliation(userSq);
    }

    public ApplicationPassDTO findApplicationDetail(Long applicationSq) {
        return applicationMapper.findApplicationDetail(applicationSq);
    }

    public void insertCompanyMember(ApplicationPassDTO dto) {
        applicationMapper.insertCompanyMember(dto);
    }
}
