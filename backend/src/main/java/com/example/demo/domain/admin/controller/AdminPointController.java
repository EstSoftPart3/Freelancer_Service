package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.AdminPointResponse;
import com.example.demo.domain.admin.service.AdminPointService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/points")
@RequiredArgsConstructor
public class AdminPointController {

    private final AdminPointService adminPointService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminPointResponse>>> getAdminPointList() {
        log.info("관리자 포인트 목록 조회");

        List<AdminPointResponse> response = adminPointService.getAdminPointList();

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "관리자 포인트 목록 조회 성공", response)
        );
    }
}