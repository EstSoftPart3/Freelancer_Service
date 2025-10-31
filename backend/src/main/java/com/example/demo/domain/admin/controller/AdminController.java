package com.example.demo.domain.admin.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.request.AdminReportRequest;
import com.example.demo.domain.admin.dto.response.AdminMemberListResponse;
import com.example.demo.domain.admin.dto.response.AdminMemberResponse;
import com.example.demo.domain.admin.service.AdminService;
import com.example.demo.domain.admin.service.AdminReportService;
import com.example.demo.domain.user.util.JwtAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final AdminService adminService;
    private final AdminReportService adminReportService;
    
    // 관리자 타입 코드 (303)
    private static final Long ADMIN_TYPE_CD = 303L;
    
    // ========================================
    // 회원 관리 API
    // ========================================
    
    /**
     * 회원 목록 조회 (페이지네이션, 필터링)
     * 
     * @param authentication 인증 정보
     * @param searchQuery 검색어 (아이디, 이름, 이메일)
     * @param userTypeCd 회원 유형 코드 (개인/기업)
     * @param userIsActivateYn 계정 상태 (Y: 활성화, N: 비활성화)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     */
    @GetMapping("/members")
    public ResponseEntity<ApiResponse<AdminMemberListResponse>> getMemberList(
            Authentication authentication,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) Long userTypeCd,
            @RequestParam(required = false) String userIsActivateYn,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        AdminMemberListResponse response = adminService.getMemberList(
                searchQuery,
                userTypeCd,
                userIsActivateYn,
                page,
                size
        );
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 목록 조회 성공", response));
    }
    
    /**
     * 회원 상세 정보 조회
     * 
     * @param authentication 인증 정보
     * @param userSq 회원 순번
     */
    @GetMapping("/members/{userSq}")
    public ResponseEntity<ApiResponse<AdminMemberResponse>> getMemberDetail(
            Authentication authentication,
            @PathVariable Long userSq
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        AdminMemberResponse response = adminService.getMemberDetail(userSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 정보 조회 성공", response));
    }
    
    /**
     * 회원 계정 상태 변경 (활성화/비활성화)
     * 
     * @param authentication 인증 정보
     * @param userSq 회원 순번
     * @param request { "userIsActivateYn": "Y" or "N" }
     */
    @PatchMapping("/members/{userSq}/status")
    public ResponseEntity<ApiResponse<Void>> updateMemberStatus(
            Authentication authentication,
            @PathVariable Long userSq,
            @RequestBody Map<String, String> request
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        String userIsActivateYn = request.get("userIsActivateYn");
        adminService.updateMemberStatus(userSq, userIsActivateYn);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 상태 변경 성공", null));
    }
    
    /**
     * 프로젝트 활성화 상태 변경
     * 
     * @param authentication 인증 정보
     * @param projectSq 프로젝트 순번
     * @param request { "projectActivateYn": "Y" or "N" }
     */
    @PatchMapping("/projects/{projectSq}/activate")
    public ResponseEntity<ApiResponse<Void>> updateProjectActivateStatus(
            Authentication authentication,
            @PathVariable Long projectSq,
            @RequestBody Map<String, String> request
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        String projectActivateYn = request.get("projectActivateYn");
        adminService.updateProjectActivateStatus(projectSq, projectActivateYn);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 활성화 상태 변경 성공", null));
    }
    
    // ========================================
    // 신고 관리 API
    // ========================================
    
    /**
     * 신고 목록 조회
     * 
     * @param authentication 인증 정보
     * @param searchQuery 검색어 (제목/신고자ID)
     * @param reportDate 신고일자 (YYYY-MM-DD)
     * @param reportReason 신고 사유
     * @param status 상태 (R: 대기중, C: 처리완료)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            Authentication authentication,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) String reportDate,
            @RequestParam(required = false) String reportReason,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        Map<String, Object> result = adminReportService.getReports(
                searchQuery, reportDate, reportReason, status, page, size
        );
        
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "신고 목록 조회 성공", result));
    }
    
    /**
     * 신고 상세 조회
     * 
     * @param authentication 인증 정보
     * @param reportSq 신고 순번
     */
    @GetMapping("/reports/{reportSq}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportDetail(
            Authentication authentication,
            @PathVariable Long reportSq
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        Map<String, Object> result = adminReportService.getReportDetail(reportSq);
        
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "신고 상세 조회 성공", result));
    }
    
    /**
     * 신고 처리 결과 등록
     * 
     * @param authentication 인증 정보
     * @param reportSq 신고 순번
     * @param request 처리 결과 내용
     */
    @PostMapping("/reports/{reportSq}/process")
    public ResponseEntity<ApiResponse<Void>> processReport(
            Authentication authentication,
            @PathVariable Long reportSq,
            @RequestBody AdminReportRequest request
    ) {
        // 관리자 권한 체크
        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        if (!ADMIN_TYPE_CD.equals(token.getUserTypeCd())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.of(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.", null));
        }
        
        adminReportService.processReport(reportSq, request);
        
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "신고 처리 완료", null));
    }
}

