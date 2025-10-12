package com.example.demo.domain.community.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.service.ReplyService;
import lombok.RequiredArgsConstructor;
import javax.lang.model.type.NullType;

@RestController
@RequestMapping("/reply")
@RequiredArgsConstructor
public class ReplyController {
    private final ReplyService replyService;

    // 대댓글 등록
    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createReply(
            @AuthenticationPrincipal Long userSq,
            @RequestParam Long commentSq,
            @RequestParam Long boardSq,
            @RequestParam String description) {

        replyService.createReply(userSq, commentSq, boardSq, description);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "대댓글 등록이 완료되었습니다.", null));
    }

    // 대댓글 수정
    @PutMapping("/{replyCommentSq}")
    public ResponseEntity<ApiResponse<NullType>> updateReply(
            @AuthenticationPrincipal Long userSq,
            @PathVariable Long replyCommentSq,
            @RequestParam String description) {

        replyService.updateReply(userSq, replyCommentSq, description);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "대댓글 수정이 완료되었습니다.", null));
    }

    // 대댓글 삭제
    @PatchMapping("/{replyCommentSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteReply(
            @AuthenticationPrincipal Long userSq,
            @PathVariable Long replyCommentSq) {

        replyService.deleteReply(userSq, replyCommentSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "대댓글 삭제가 완료되었습니다.", null));
    }

    // 대댓글 추천
    @PostMapping("/{replyCommentSq}/recommend")
    public ResponseEntity<ApiResponse<NullType>> updateRecommendReply(
            @AuthenticationPrincipal Long userSq,
            @PathVariable Long replyCommentSq) {

        replyService.updateRecommendCntReply(userSq, replyCommentSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "대댓글 추천 반영이 완료되었습니다.", null));
    }
}

