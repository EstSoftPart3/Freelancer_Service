package com.example.demo.domain.point.service;

import java.util.List;

import com.example.demo.domain.point.dto.PointHistoryResponse;
import com.example.demo.domain.point.dto.PointResponse;

public interface PointService {

    PointResponse getMyPoint(Long userSq);
    
    List<PointHistoryResponse> getMyPointHistory(Long userSq);
    
    void earnAttendancePoint(Long userSq);
}