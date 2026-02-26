package com.example.demo.domain.admin.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.service.AdminNoticeService;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.request.CommentRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.service.BoardService;
import com.example.demo.domain.community.service.CommentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/notice") // 관리자 전용 경로
@RequiredArgsConstructor
public class AdminNoticeController {
    private final BoardService boardService;
    private final AdminNoticeService adminNoticeService;
    private final CommentService commentService;

    /**
     * 공지사항 목록 조회 (검색 + 정렬 적용)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<BoardListResponse>> getNotices(
            @RequestParam(value = "keyword", required = false) String keyword, // 제목 검색용
            @RequestParam(value = "sortField", defaultValue = "createdAt") String sortField, // 정렬 컬럼 (sq, ttl,
                                                                                             // createdAt 등)
            @RequestParam(value = "sortOrder", defaultValue = "DESC") String sortOrder, // 정렬 순서 (ASC, DESC)
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        // 1403L(공지사항) 고정 및 검색/정렬 파라미터 전달
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "공지사항 조회 성공",
                adminNoticeService.getAdminNotices(1403L, keyword, sortField, sortOrder, page, size)));
    }

    // 공지사항 등록
    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createNotice(
            @AuthenticationPrincipal Long userSq,
            @ModelAttribute BoardRequest boardRequest) {

        boardRequest.setUserSq(userSq);
        boardService.createBoard(boardRequest, 1403L);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "공지사항 등록 성공", null));
    }

    // 공지사항 수정
    @PatchMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<NullType>> updateNotice(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq,
            @ModelAttribute BoardRequest boardRequest) {

        boardRequest.setUserSq(userSq);
        boardService.updateBoard(boardRequest, boardSq, 1403L);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "공지사항 수정 성공", null));
    }

    @DeleteMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteNotice(
            @AuthenticationPrincipal Long userSq,
            @PathVariable Long boardSq) {

        boardService.deleteBoard(userSq, boardSq);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "성공적으로 삭제되었습니다.", null));
    }

    // 공지사항 상세 조회
    @GetMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<BoardResponse>> getNotice(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq) {
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회 성공",
                boardService.getBoard(userSq, boardSq, 1403L)));
    }

    /**
     * 공지사항 댓글 등록
     */
    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<NullType>> createNoticeComment(
            @AuthenticationPrincipal Long userSq,
            @RequestBody CommentRequest commentRequest) {

        commentRequest.setUserSq(userSq);
        adminNoticeService.createAdminComment(commentRequest); // AdminNoticeService 호출
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "댓글 등록이 완료되었습니다.", null));
    }

    /**
     * 공지사항 댓글 수정 (관리자용)
     */
    @PutMapping("/comments/{commentSq}")
    public ResponseEntity<ApiResponse<NullType>> updateNoticeComment(
            @PathVariable("commentSq") Long commentSq,
            @RequestBody CommentRequest commentRequest) {

        adminNoticeService.updateAdminComment(commentSq, commentRequest);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "관리자 권한으로 댓글이 수정되었습니다.", null));
    }

    /**
     * 공지사항 댓글 삭제 (관리자용)
     */
    @DeleteMapping("/comments/{commentSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteNoticeComment(
            @PathVariable("commentSq") Long commentSq) {

        adminNoticeService.deleteAdminComment(commentSq); // AdminNoticeService 호출
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "관리자 권한으로 댓글이 삭제되었습니다.", null));
    }

}
