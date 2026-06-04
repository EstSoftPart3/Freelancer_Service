package com.example.demo.domain.point.service;

import org.springframework.stereotype.Service;

import com.example.demo.domain.point.dto.PointResponse;
import com.example.demo.domain.point.mapper.PointMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PointServiceImpl implements PointService {

    private final PointMapper pointMapper;

    @Override
    public PointResponse getCurrentPoint(Long userSq) {
        int currentPoint = pointMapper.selectCurrentPoint(userSq);

        return new PointResponse(currentPoint);
    }
}