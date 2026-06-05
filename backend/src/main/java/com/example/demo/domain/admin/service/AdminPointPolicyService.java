package com.example.demo.domain.admin.service;

import org.springframework.stereotype.Service;

import com.example.demo.domain.admin.dto.AdminPointPolicyResponse;
import com.example.demo.domain.admin.dto.AdminPointPolicyUpdateRequest;
import com.example.demo.domain.admin.mapper.AdminPointPolicyMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPointPolicyService {

    private final AdminPointPolicyMapper adminPointPolicyMapper;

    public AdminPointPolicyResponse getPointPolicy() {
        return adminPointPolicyMapper.selectPointPolicy();
    }
    
    public void updatePointPolicy(AdminPointPolicyUpdateRequest request) {
        int updatedCount = adminPointPolicyMapper.updatePointPolicy(request);

        System.out.println("포인트 정책 수정 요청값 = " + request);
        System.out.println("포인트 정책 수정 row count = " + updatedCount);

        if (updatedCount == 0) {
            throw new RuntimeException("포인트 정책 수정 대상이 없습니다.");
        }
    }
}