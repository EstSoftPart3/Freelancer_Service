package com.example.demo.domain.admin.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.response.AdminMemberListResponse;
import com.example.demo.domain.admin.dto.response.AdminMemberResponse;
import com.example.demo.domain.admin.service.AdminService;
import com.example.demo.domain.user.util.JwtAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/members")
@RequiredArgsConstructor
public class AdminController {
    
    private final AdminService adminService;
    
    // 관리자 타입 코드 (303)
    private static final Long ADMIN_TYPE_CD = 303L;
    
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
    @GetMapping
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
    @GetMapping("/{userSq}")
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
    @PatchMapping("/{userSq}/status")
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
}

