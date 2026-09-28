package com.example.demo.domain.vote.controller;

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
import com.example.demo.domain.vote.dto.request.BallotRequest;
import com.example.demo.domain.vote.dto.request.VoteCreateRequest;
import com.example.demo.domain.vote.dto.response.VoteDetailResponse;
import com.example.demo.domain.vote.dto.response.VoteListResponse;
import com.example.demo.domain.vote.service.VoteService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * 투표(Vote) — 커뮤니티 대분류 6개 중 하나. 댓글·추천·신고 없음(MVP 확정 범위).
 *
 * <p>
 * 목록·상세·조회수 증가는 공개, 등록·삭제·투표 참여는 인증 필요.
 * {@code SecurityConfigProd}와 {@code JwtAuthenticationFilter.EXCLUDE_URLS} 양쪽 모두
 * GET만 열어둔다 — 한쪽만 열면 다른 쪽에서 401이 나는 함정은 career/tech 등과 동일하다.
 * </p>
 */
@RestController
@RequestMapping("/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final ViewCountDedupService viewCountDedupService;

    @GetMapping
    public ResponseEntity<ApiResponse<VoteListResponse>> getAllVotes(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "category", required = false) Long category,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표 목록 조회 성공",
                voteService.getAllVotes(keyword, sortType, category, page, size)));
    }

    @GetMapping("/{voteSq}")
    public ResponseEntity<ApiResponse<VoteDetailResponse>> getVote(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("voteSq") Long voteSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표 상세 조회 성공",
                voteService.getVote(userSq, voteSq)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createVote(
            @AuthenticationPrincipal Long userSq,
            @RequestBody VoteCreateRequest request) {

        request.setUserSq(userSq);
        voteService.createVote(request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "투표가 등록되었습니다.", null));
    }

    @PatchMapping("/{voteSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteVote(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("voteSq") Long voteSq) {

        voteService.deleteVote(userSq, voteSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표가 삭제되었습니다.", null));
    }

    @PatchMapping("/{voteSq}/increment-view")
    public ResponseEntity<ApiResponse<NullType>> addViewCnt(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("voteSq") Long voteSq,
            HttpServletRequest request) {

        if (viewCountDedupService.isFirstView("vote", voteSq, userSq, request)) {
            voteService.addViewCnt(voteSq);
        }
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가 완료", null));
    }

    @PostMapping("/{voteSq}/ballot")
    public ResponseEntity<ApiResponse<NullType>> castBallot(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("voteSq") Long voteSq,
            @RequestBody BallotRequest request) {

        voteService.castBallot(userSq, voteSq, request.getVoteOptionSq());
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표가 완료되었습니다.", null));
    }
}
