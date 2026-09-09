package com.example.demo.domain.community.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.dto.request.*;
import com.example.demo.domain.community.service.*;

import lombok.RequiredArgsConstructor;

import javax.lang.model.type.NullType;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    // 댓글 등록
    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createComment(@AuthenticationPrincipal Long userSq,
            @RequestBody CommentRequest commentRequest) {
        commentRequest.setUserSq(userSq);
        commentService.createComment(commentRequest);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "댓글 등록이 완료되었습니다.", null));
    }

    // 댓글 수정
    @PutMapping("/{commentSq}")
    public ResponseEntity<ApiResponse<NullType>> updateComment(@AuthenticationPrincipal Long userSq,
            @RequestBody CommentRequest commentRequest, @PathVariable("commentSq") Long commentSq) {
        commentRequest.setUserSq(userSq);
        commentService.updateComment(commentRequest, commentSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "댓글 수정이 완료되었습니다.", null));
    }

    // 댓글 삭제
    @PatchMapping("/{commentSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteComment(@AuthenticationPrincipal Long userSq,
            @PathVariable("commentSq") Long commentSq) {
        commentService.deleteComment(userSq, commentSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "댓글 삭제가 완료되었습니다.", null));
    }

    @PostMapping("/{commentSq}/recommend")
    public ResponseEntity<ApiResponse<NullType>> updateRecommendComment(@AuthenticationPrincipal Long userSq,
            @PathVariable("commentSq") Long commentSq) {
        commentService.updateRecommendCntComment(userSq, commentSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "댓글 추천 반영이 완료되었습니다.", null));
    }

}