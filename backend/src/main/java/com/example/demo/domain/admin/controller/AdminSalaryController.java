package com.example.demo.domain.admin.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.service.AdminSalaryService;
import com.example.demo.domain.salary.dto.request.SalarySubmissionRequest;
import com.example.demo.domain.salary.dto.response.SalaryListResponse;
import com.example.demo.domain.salary.dto.response.SalarySubmissionResponse;

import lombok.RequiredArgsConstructor;

/**
 * BO 연봉 제출건 관리(계산기/리포트/순위표가 읽는 원자료). 등록은 회원 지정(실데이터) 또는
 * 시드 닉네임 지정(시드) 중 하나를 골라야 한다({@link SalarySubmissionRequest#getIsSeedYn}).
 */
@RestController
@RequestMapping("/admin/salary")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminSalaryController {

    private final AdminSalaryService adminSalaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<SalaryListResponse>> getSubmissions(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "isSeedYn", required = false) String isSeedYn,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "12") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "연봉 제출건 목록 조회 성공",
                adminSalaryService.getAdminSubmissions(keyword, isSeedYn, sortType, page, size)));
    }

    @GetMapping("/{salarySubmissionSq}")
    public ResponseEntity<ApiResponse<SalarySubmissionResponse>> getSubmission(
            @PathVariable("salarySubmissionSq") Long salarySubmissionSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "연봉 제출건 상세 조회 성공",
                adminSalaryService.getAdminSubmission(salarySubmissionSq)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createSubmission(@RequestBody SalarySubmissionRequest request) {

        adminSalaryService.createSubmission(request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "연봉 제출건이 등록되었습니다.", null));
    }

    @PatchMapping("/{salarySubmissionSq}")
    public ResponseEntity<ApiResponse<NullType>> updateSubmission(
            @PathVariable("salarySubmissionSq") Long salarySubmissionSq,
            @RequestBody SalarySubmissionRequest request) {

        adminSalaryService.updateSubmission(salarySubmissionSq, request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "연봉 제출건이 수정되었습니다.", null));
    }

    @DeleteMapping("/{salarySubmissionSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteSubmission(
            @PathVariable("salarySubmissionSq") Long salarySubmissionSq) {

        adminSalaryService.deleteSubmission(salarySubmissionSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "연봉 제출건이 삭제되었습니다.", null));
    }
}
