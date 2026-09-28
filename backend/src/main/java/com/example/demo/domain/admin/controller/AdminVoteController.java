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
import com.example.demo.domain.admin.dto.request.AdminVoteUpdateRequestDTO;
import com.example.demo.domain.admin.service.AdminVoteService;
import com.example.demo.domain.vote.dto.request.VoteCreateRequest;
import com.example.demo.domain.vote.dto.response.VoteDetailResponse;
import com.example.demo.domain.vote.dto.response.VoteListResponse;
import com.example.demo.domain.vote.service.VoteService;

import lombok.RequiredArgsConstructor;

/**
 * BO 투표 관리.
 *
 * <p>
 * 등록은 {@link VoteService#createVote} 를 그대로 재사용한다 — FO 와 다른 검증 규칙(카테고리 화이트리스트,
 * 선택지 2개 이상)이 두 곳에 따로 생기지 않게 하기 위함(AdminBoardController 가 BoardService 를 직접
 * 부르는 것과 같은 이유). 작성자는 등록한 관리자 본인이 된다.
 * </p>
 */
@RestController
@RequestMapping("/admin/vote")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminVoteController {

    private final AdminVoteService adminVoteService;
    private final VoteService voteService;

    @GetMapping
    public ResponseEntity<ApiResponse<VoteListResponse>> getVotes(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) Long category,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표 목록 조회 성공",
                adminVoteService.getAdminVotes(keyword, category, sortType, page, size)));
    }

    @GetMapping("/{voteSq}")
    public ResponseEntity<ApiResponse<VoteDetailResponse>> getVote(@PathVariable("voteSq") Long voteSq) {
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표 상세 조회 성공",
                adminVoteService.getAdminVote(voteSq)));
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
    public ResponseEntity<ApiResponse<NullType>> updateVote(
            @PathVariable("voteSq") Long voteSq,
            @RequestBody AdminVoteUpdateRequestDTO request) {

        adminVoteService.updateVote(voteSq, request);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표가 수정되었습니다.", null));
    }

    @DeleteMapping("/{voteSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteVote(@PathVariable("voteSq") Long voteSq) {
        adminVoteService.deleteVote(voteSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "투표가 삭제되었습니다.", null));
    }
}
