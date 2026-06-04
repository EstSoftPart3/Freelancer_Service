package com.example.demo.domain.admin.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.admin.dto.AdminPointPolicyResponse;
import com.example.demo.domain.admin.dto.AdminPointPolicyUpdateRequest;

@Mapper
public interface AdminPointPolicyMapper {

    AdminPointPolicyResponse selectPointPolicy();
    
    int updatePointPolicy(AdminPointPolicyUpdateRequest request);
}