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
        adminPointPolicyMapper.updatePointPolicy(request);
    }
}