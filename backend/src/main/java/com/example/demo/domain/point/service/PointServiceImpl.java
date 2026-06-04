package com.example.demo.domain.point.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.point.dto.PointResponse;
import com.example.demo.domain.point.mapper.PointMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PointServiceImpl implements PointService {

    private final PointMapper pointMapper;

    @Override
    @Transactional(readOnly = true)
    public PointResponse getMyPoint(Long userSq) {
        int pointAmount = pointMapper.selectPointAmount(userSq);

        return new PointResponse(pointAmount);
    }
}