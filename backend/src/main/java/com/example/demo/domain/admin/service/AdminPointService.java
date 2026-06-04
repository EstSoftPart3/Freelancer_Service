package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.admin.dto.AdminPointResponse;
import com.example.demo.domain.admin.mapper.AdminPointMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPointService {

    private final AdminPointMapper adminPointMapper;

    public List<AdminPointResponse> getAdminPointList() {
        return adminPointMapper.selectAdminPointList();
    }
}