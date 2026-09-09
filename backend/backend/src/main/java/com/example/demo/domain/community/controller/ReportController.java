package com.example.demo.domain.community.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.dto.request.ReportRequest;
import com.example.demo.domain.community.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createReport(
            @AuthenticationPrincipal Long userSq, // 시큐리티 사용 시
            @RequestBody ReportRequest request) {

        // Vue 코드에서 userSq: 2로 하드코딩된 부분은 보안상 서버에서 loginUserSq로 대체 권장
        reportService.registerReport(request, userSq != null ? userSq : request.getUserSq());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "신고가 정상적으로 접수되었습니다.", null));
    }

    /**
     * 신고 사유 등 공통 코드 조회
     * 
     * @param parentSq 부모 코드 번호 (예: 신고 사유는 2800)
     */
    @GetMapping("/codes/{parentSq}")
    public ResponseEntity<ApiResponse<List<CommonCodeDTO>>> getReportCodes(@PathVariable Long parentSq) {
        List<CommonCodeDTO> codes = reportService.getCodesByParent(parentSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "코드 조회 성공", codes));
    }
}