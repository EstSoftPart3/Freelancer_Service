package com.example.demo.domain.mypage.controller;

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
import com.example.demo.domain.mypage.dto.request.ResumeDetailViewRequestDTO;
import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;
import com.example.demo.domain.mypage.service.ResumeDetailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class ResumeDetailController {

    private final ResumeDetailService resumeDetailService;

    @GetMapping("/resume-detail/{resumeSq}")
    public ResponseEntity<ApiResponse<ResumeDetailResponseDTO>> getResumeDetail(
            @PathVariable(name = "resumeSq") Long resumeSq) {
        ResumeDetailResponseDTO response = resumeDetailService.getResumeDetail(resumeSq);
        if (response != null) {
            return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 정보 조회 완료", response));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST, "유효하지 않은 이력서입니다."));
        }
    }

    @PostMapping("/resume-detail-view")
    public ResponseEntity<ApiResponse<ResumeDetailResponseDTO>> getResumeDetailAndMarkViewed(
            @AuthenticationPrincipal Long userSq,
            @RequestBody ResumeDetailViewRequestDTO requestDTO) {

        ResumeDetailResponseDTO response = resumeDetailService.getResumeDetailAndMarkViewed(userSq, requestDTO);

        if (response != null) {
            return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 열람 처리 및 조회 완료", response));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST, "유효하지 않은 요청입니다."));
        }
    }
}
