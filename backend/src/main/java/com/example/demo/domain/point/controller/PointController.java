package com.example.demo.domain.point.controller;

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
    public PointResponse getCurrentPoint(@AuthenticationPrincipal Long userSq) {
        return pointService.getCurrentPoint(userSq);
    }
}	