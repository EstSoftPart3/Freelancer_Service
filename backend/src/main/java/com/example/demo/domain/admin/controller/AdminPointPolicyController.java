package com.example.demo.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.AdminPointPolicyResponse;
import com.example.demo.domain.admin.service.AdminPointPolicyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/points/policy")
public class AdminPointPolicyController {

    private final AdminPointPolicyService adminPointPolicyService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminPointPolicyResponse>> getPointPolicy() {
        AdminPointPolicyResponse pointPolicy = adminPointPolicyService.getPointPolicy();

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "포인트 정책 조회 성공", pointPolicy)
        );
    }
}