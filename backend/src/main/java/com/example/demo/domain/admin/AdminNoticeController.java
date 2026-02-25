package com.example.demo.domain.admin;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.service.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/notice") // 관리자 전용 경로
@RequiredArgsConstructor
public class AdminNoticeController {
    private final BoardService boardService;

    // 공지사항 전체 조회 (1403L 고정)
    @GetMapping
    public ResponseEntity<ApiResponse<BoardListResponse>> getNotices(
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        // 1403L을 고정으로 넘겨 공지만 가져옵니다.
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "공지사항 조회 성공",
                boardService.getAllBoards(1403L, null, null, null, null, null, "latest", page, size)));
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
}
