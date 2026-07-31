package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.response.AdminReportListResponseDTO;
import com.example.demo.domain.admin.service.AdminReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/report")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    /**
     * [BO] 신고 목록 조회
     */
    @GetMapping
    public ResponseEntity<?> getReports(
            @RequestParam(required = false) List<Long> statusCds,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(defaultValue = "createdAt") String sortField, // [추가]
            @RequestParam(defaultValue = "DESC") String sortOrder // [추가]
    ) {
        return ResponseEntity.ok(adminReportService.getReports(statusCds, keyword, page, size, sortField, sortOrder));
    }

    /**
     * [BO] 신고 상세 조회 (원문 본문 내용 포함)
     * GET /admin/report/{reportSq}
     */
    @GetMapping("/{reportSq}")
    public ResponseEntity<?> getReportDetail(@PathVariable Long reportSq) {
        // 서비스에서 상세 데이터를 가져오도록 호출
        return ResponseEntity.ok(adminReportService.getReportDetail(reportSq));
    }

    /**
     * [BO] 신고 처리 (처리완료/반려 등)
     */
    @PatchMapping("/{reportSq}/process")
    public ResponseEntity<ApiResponse<Void>> processReport(
            @AuthenticationPrincipal Long userSq,
            @PathVariable Long reportSq,
            @RequestParam("statusCd") Long statusCd,
            @RequestParam(value = "processDesc", required = false) String processDesc) {

        adminReportService.processReport(reportSq, statusCd, processDesc, userSq);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "신고 처리가 완료되었습니다.", null));
    }
}