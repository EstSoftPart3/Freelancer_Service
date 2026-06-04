package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.admin.dto.AdminPointResponse;

@Mapper
public interface AdminPointMapper {

    List<AdminPointResponse> selectAdminPointList();
}