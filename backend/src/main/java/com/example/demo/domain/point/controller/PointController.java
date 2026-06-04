package com.example.demo.domain.point.controller;

import java.util.List;

import com.example.demo.domain.point.dto.PointHistoryResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.point.dto.PointResponse;
import com.example.demo.domain.point.service.PointService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;

    @GetMapping("/mypage/points")
    public ResponseEntity<PointResponse> getMyPoint(
            @AuthenticationPrincipal Long userSq) {

        PointResponse response = pointService.getMyPoint(userSq);

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/mypage/points/history")
    public ResponseEntity<List<PointHistoryResponse>> getMyPointHistory(
            @AuthenticationPrincipal Long userSq) {

        List<PointHistoryResponse> response = pointService.getMyPointHistory(userSq);

        return ResponseEntity.ok(response);
    }
}