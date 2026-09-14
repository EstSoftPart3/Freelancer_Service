package com.example.demo.domain.interview.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.viewcount.ViewCountDedupService;
import com.example.demo.domain.interview.dto.request.InterviewReviewRequest;
import com.example.demo.domain.interview.dto.response.InterviewDetailResponse;
import com.example.demo.domain.interview.dto.response.InterviewListResponse;
import com.example.demo.domain.interview.service.InterviewService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * 면접후기 — 커리어소통과는 완전히 분리된 전용 도메인(사용자 확정). 댓글·추천·신고 없음(MVP 확정 범위).
 */
@RestController
@RequestMapping("/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final ViewCountDedupService viewCountDedupService;

    @GetMapping
    public ResponseEntity<ApiResponse<InterviewListResponse>> getAllReviews(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "companyNm", required = false) String companyNm,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "12") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기 목록 조회 성공",
                interviewService.getAllReviews(keyword, companyNm, sortType, page, size)));
    }

    @GetMapping("/{interviewReviewSq}")
    public ResponseEntity<ApiResponse<InterviewDetailResponse>> getReview(
            @PathVariable("interviewReviewSq") Long interviewReviewSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기 상세 조회 성공",
                interviewService.getReview(interviewReviewSq)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createReview(
            @AuthenticationPrincipal Long userSq,
            @RequestBody InterviewReviewRequest request) {

        request.setUserSq(userSq);
        interviewService.createReview(request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "면접후기가 등록되었습니다.", null));
    }

    @PatchMapping("/{interviewReviewSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteReview(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("interviewReviewSq") Long interviewReviewSq) {

        interviewService.deleteReview(userSq, interviewReviewSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기가 삭제되었습니다.", null));
    }

    @PatchMapping("/{interviewReviewSq}/increment-view")
    public ResponseEntity<ApiResponse<NullType>> addViewCnt(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("interviewReviewSq") Long interviewReviewSq,
            HttpServletRequest request) {

        if (viewCountDedupService.isFirstView("interview", interviewReviewSq, userSq, request)) {
            interviewService.addViewCnt(interviewReviewSq);
        }
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가 완료", null));
    }
}
