package com.example.demo.domain.admin.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.admin.dto.AdminPointPolicyResponse;

@Mapper
public interface AdminPointPolicyMapper {

    AdminPointPolicyResponse selectPointPolicy();
}