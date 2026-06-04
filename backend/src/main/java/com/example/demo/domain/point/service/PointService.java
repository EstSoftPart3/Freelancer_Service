package com.example.demo.domain.point.service;

import com.example.demo.domain.point.dto.PointResponse;

public interface PointService {

    PointResponse getMyPoint(Long userSq);
}