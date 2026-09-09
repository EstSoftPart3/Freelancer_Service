package com.example.demo.domain.user.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.user.mapper.CompanyVerificationMapper;

@Repository
@RequiredArgsConstructor
public class CompanyVerificationRepository {

    private final CompanyVerificationMapper mapper;

    public boolean existsByBizNum(String bizNum) {
        return mapper.existsByBizNum(bizNum);
    }
}