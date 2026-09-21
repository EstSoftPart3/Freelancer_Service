package com.example.demo.domain.admin.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.example.demo.domain.admin.service.AdminInterviewService;
import com.example.demo.domain.interview.dto.request.InterviewReviewRequest;
import com.example.demo.domain.interview.dto.response.InterviewDetailResponse;
import com.example.demo.domain.interview.dto.response.InterviewListResponse;
import com.example.demo.domain.interview.service.InterviewService;

import lombok.RequiredArgsConstructor;

/**
 * BO 면접후기 관리.
 *
 * <p>
 * 등록은 {@link InterviewService#createReview}를 그대로 재사용한다 — FO와 다른 검증 규칙이 두 곳에
 * 따로 생기지 않게 하기 위함(AdminVoteController가 VoteService를 그대로 부르는 것과 같은 이유).
 * 작성자는 등록한 관리자 본인이 된다.
 * </p>
 */
@RestController
@RequestMapping("/admin/interview")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminInterviewController {

    private final AdminInterviewService adminInterviewService;
    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<InterviewListResponse>> getReviews(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "12") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기 목록 조회 성공",
                adminInterviewService.getAdminReviews(keyword, sortType, page, size)));
    }

    @GetMapping("/{interviewReviewSq}")
    public ResponseEntity<ApiResponse<InterviewDetailResponse>> getReview(
            @PathVariable("interviewReviewSq") Long interviewReviewSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기 상세 조회 성공",
                adminInterviewService.getAdminReview(interviewReviewSq)));
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
    public ResponseEntity<ApiResponse<NullType>> updateReview(
            @PathVariable("interviewReviewSq") Long interviewReviewSq,
            @RequestBody InterviewReviewRequest request) {

        adminInterviewService.updateReview(interviewReviewSq, request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기가 수정되었습니다.", null));
    }

    @DeleteMapping("/{interviewReviewSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteReview(
            @PathVariable("interviewReviewSq") Long interviewReviewSq) {

        adminInterviewService.deleteReview(interviewReviewSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "면접후기가 삭제되었습니다.", null));
    }
}
