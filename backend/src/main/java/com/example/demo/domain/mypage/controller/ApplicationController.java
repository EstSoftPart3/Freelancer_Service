package com.example.demo.domain.mypage.controller;

import com.example.demo.domain.mypage.dto.response.AffiliationApplyReadResponseDTO;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.affiliation.service.AffiliationService;
import com.example.demo.domain.mypage.dto.ApplicationPassDTO;
import com.example.demo.domain.mypage.service.ApplicationService;
import com.example.demo.domain.affiliation.dto.response.*;
import com.example.demo.domain.affiliation.entity.*;

import lombok.RequiredArgsConstructor;

import javax.lang.model.type.NullType;

@RestController
@RequestMapping("/mypage/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final AffiliationService affiliationService;
    private final ApplicationService applicationService;

    // 소속 신청 내역 하나 조회
    @GetMapping("/{applicationSq}")
    public ResponseEntity<ApiResponse<ApplyResponse>> getAffiliation(
            @PathVariable("applicationSq") Long applicationSq) {
        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "소속 공고 조회가 완료되었습니다.", affiliationService.getAffiliaion(applicationSq)));
    }

    // 회사
    // 소속 공고 지원자 현황 목록 조회
    @GetMapping("/company")
    public ResponseEntity<ApiResponse<ApplicantListResponse>> getAppliesByCompanySq(
            @AuthenticationPrincipal Long userSq,
            @RequestParam(value = "searchType", required = false) String searchType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "readType", required = false) String readType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 공고 지원 현황 목록 조회가 완료되었습니다.",
                affiliationService.getAppliesByCompanySq(userSq, searchType, keyword, readType, page, size)));
    }

    // 열람 상태 변경
    @PutMapping("/read/{companyApplicationSq}")
    public ResponseEntity<ApiResponse<AffiliationApplyReadResponseDTO>> updateApplicationReadAt(
            @PathVariable("companyApplicationSq") Long companyApplicationSq) {
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 지원 신청 열람이 완료되었습니다.",
                affiliationService.updateApplicationReadAt(companyApplicationSq)));
    }

    // 합격 또는 불합격 변경
    @PutMapping("/apply/{companyApplicationSq}")
    public ResponseEntity<ApiResponse<NullType>> updateApplicationStatus(
            @PathVariable("companyApplicationSq") Long companyApplicationSq,
            @RequestBody CompanyApplication companyApplication) {

        Long statusCd = companyApplication.getCompanyApplicationStatusCd();

        // 지원 상태 업데이트
        affiliationService.updateApplicationStatus(companyApplicationSq, statusCd);

        // 합격 처리(502)일 경우 → 소속 등록
        if (statusCd == 502L) {
            ApplicationPassDTO applicationPassDTO = applicationService.findApplicationDetail(companyApplicationSq);
            applicationService.processPass(applicationPassDTO);
        }

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 지원 상태 수정이 완료되었습니다.", null));
    }

    // 개인
    // 소속 공고 지원 현황 목록 조회
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<ApplicationListResponse>> getAppliesByUserSq(
            @AuthenticationPrincipal Long userSq,
            @RequestParam(value = "searchType", required = false) String searchType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "readType", required = false) String readType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 공고 지원 현황 목록 조회가 완료되었습니다.",
                affiliationService.getAppliesByUserSq(userSq, searchType, keyword, readType, page, size)));
    }

    // 소속 공고 지원 취소
    @PatchMapping("/{companyApplicationSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteApplication(
            @PathVariable("companyApplicationSq") Long companyApplicationSq) {
        affiliationService.deleteApplication(companyApplicationSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 공고 지원이 취소되었습니다.", null));
    }

    // 소속 공고 스크랩 리스트
    @GetMapping("/scraps")
    public ResponseEntity<ApiResponse<AffiliationListResponse>> getScraps(
            @AuthenticationPrincipal Long userSq,
            @RequestParam(value = "searchType", required = false) String searchType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 공고 스크랩 리스트 조회가 완료되었습니다.",
                affiliationService.getScraps(userSq, searchType, keyword, page, size)));
    }

}