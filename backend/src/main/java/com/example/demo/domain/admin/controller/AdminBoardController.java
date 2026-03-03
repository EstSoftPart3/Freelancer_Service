package com.example.demo.domain.admin.controller;

import java.util.List;

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
import com.example.demo.domain.admin.dto.response.AdminBoardDetailResponseDTO;
import com.example.demo.domain.admin.dto.response.AdminBoardListResponseDTO;
import com.example.demo.domain.admin.service.AdminBoardService;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.service.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/board")
@RequiredArgsConstructor
public class AdminBoardController {
    private final AdminBoardService adminBoardService;
    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminBoardListResponseDTO>> getBoards(
            @RequestParam(value = "typeCds", required = false) List<Long> typeCds,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "tagKeyword", required = false) String tagKeyword,
            @RequestParam(value = "sortField", defaultValue = "createdAt") String sortField,
            @RequestParam(value = "sortOrder", defaultValue = "DESC") String sortOrder,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {
        // 컨트롤러 상단에 로그 추가해서 확인해보세요
        log.info("page: {}, typeCds: {}, keyword: {}", page, typeCds, keyword);

        // AdminBoardListResponse를 반환하도록 서비스 호출
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 목록 조회 성공",
                adminBoardService.getAdminBoards(typeCds, keyword, tagKeyword, sortField, sortOrder, page, size)));
    }

    // AdminBoardController.java 의 50라인 근처

    @DeleteMapping("/{sq}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(
            @PathVariable Long sq,
            @RequestParam String mainType) {

        adminBoardService.deleteMaster(sq, mainType);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글이 성공적으로 삭제되었습니다.", null));
    }

    /**
     * 게시글 등록 (일반/Q&A)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createBoard(
            @AuthenticationPrincipal Long userSq,
            @RequestParam("boardTypeCd") Long boardTypeCd,
            @ModelAttribute BoardRequest boardRequest) {

        boardRequest.setUserSq(userSq);
        boardService.createBoard(boardRequest, boardTypeCd);

        // [수정] success -> of 사용
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "게시글이 등록되었습니다.", null));
    }

    /**
     * 게시글 수정
     */
    // AdminBoardController.java

    @PatchMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<Void>> updateBoard(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq,
            @RequestParam("boardTypeCd") Long boardTypeCd,
            @ModelAttribute BoardRequest boardRequest) {

        adminBoardService.updateBoardMaster(boardSq, boardTypeCd, boardRequest);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글이 수정되었습니다.", null));
    }

    // AdminBoardController.java 에 추가

    @GetMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<AdminBoardDetailResponseDTO>> getBoardDetail(
            @PathVariable("boardSq") Long boardSq,
            @RequestParam("boardTypeCd") Long boardTypeCd) {

        AdminBoardDetailResponseDTO detail = adminBoardService.getAdminBoardDetail(boardSq, boardTypeCd);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 상세 조회 성공", detail));
    }

    /**
     * 댓글/대댓글 등록 (마스터 권한)
     */
    @PostMapping("/comment")
    public ResponseEntity<ApiResponse<Void>> createComment(
            @AuthenticationPrincipal Long userSq,
            @RequestParam("boardSq") Long boardSq,
            @RequestParam(value = "parentCommentSq", required = false) Long parentCommentSq,
            @RequestParam("description") String description) {

        adminBoardService.createCommentMaster(boardSq, parentCommentSq, userSq, description);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "댓글이 등록되었습니다.", null));
    }

    /**
     * 댓글 수정 (마스터 권한)
     */
    @PatchMapping("/comment/{commentSq}")
    public ResponseEntity<ApiResponse<Void>> updateComment(
            @PathVariable("commentSq") Long commentSq,
            @RequestParam("description") String description) {

        adminBoardService.updateCommentMaster(commentSq, description);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "댓글이 수정되었습니다.", null));
    }

    /**
     * 댓글 삭제 (마스터 권한)
     */
    @DeleteMapping("/comment/{commentSq}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable("commentSq") Long commentSq) {

        adminBoardService.deleteCommentMaster(commentSq);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "댓글이 삭제되었습니다.", null));
    }
}