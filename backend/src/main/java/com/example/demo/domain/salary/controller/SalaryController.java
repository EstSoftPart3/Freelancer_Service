package com.example.demo.domain.salary.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.salary.dto.request.SalarySubmissionRequest;
import com.example.demo.domain.salary.dto.response.SalaryRankingResponse;
import com.example.demo.domain.salary.dto.response.SalaryReportResponse;
import com.example.demo.domain.salary.dto.response.SalarySubmissionResponse;
import com.example.demo.domain.salary.service.SalaryService;

import lombok.RequiredArgsConstructor;

/**
 * 연봉계산기·리포트·순위표. 계산기 제출·리포트는 로그인 필수(사용자 확정), 순위표만 비로그인 공개다.
 *
 * <p>
 * {@code SecurityConfigProd}에는 {@code GET /salary/ranking}만 permitAll, 나머지는
 * anyRequest().authenticated()로 자동 보호된다. {@code JwtAuthenticationFilter.EXCLUDE_URLS}에도
 * {@code "/api/salary/ranking"}까지만(접두사 매칭이라 "/api/salary"로 넣으면 리포트까지 풀린다).
 * </p>
 */
@RestController
@RequestMapping("/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    @GetMapping("/submissions/me")
    public ResponseEntity<ApiResponse<SalarySubmissionResponse>> getMySubmission(
            @AuthenticationPrincipal Long userSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "제출 이력 조회 성공",
                salaryService.getMySubmission(userSq)));
    }

    @PostMapping("/submissions")
    public ResponseEntity<ApiResponse<NullType>> submit(
            @AuthenticationPrincipal Long userSq,
            @RequestBody SalarySubmissionRequest request) {

        request.setUserSq(userSq);
        salaryService.submit(request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "연봉 정보가 제출되었습니다.", null));
    }

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<SalaryReportResponse>> getReport(
            @AuthenticationPrincipal Long userSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "연봉 리포트 조회 성공",
                salaryService.getReport(userSq)));
    }

    @GetMapping("/ranking")
    public ResponseEntity<ApiResponse<SalaryRankingResponse>> getRanking(
            @RequestParam(value = "dimension", defaultValue = "all") String dimension,
            @RequestParam(value = "job", required = false) String job,
            @RequestParam(value = "years", required = false) String years,
            @RequestParam(value = "region", required = false) String region) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "연봉순위표 조회 성공",
                salaryService.getRanking(dimension, job, years, region)));
    }
}
