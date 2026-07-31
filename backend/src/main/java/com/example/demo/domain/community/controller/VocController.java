package com.example.demo.domain.community.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.viewcount.ViewCountDedupService;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.service.VocService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * 고객의 소리(VOC) — 공통코드 1404.
 *
 * <p>
 * <b>이 컨트롤러 전체가 인증 필수다.</b> {@code JwtAuthenticationFilter.EXCLUDE_URLS} 에 넣지 않았고
 * {@code SecurityConfigProd} 도 {@code /voc/**} 를 authenticated 로 선언한다. 두 화이트리스트가
 * 서로 독립이라 한쪽만 열면 다른 쪽에서 401 이 나므로, 공개로 바꿀 일이 생기면 반드시 양쪽을 함께 볼 것.
 * </p>
 *
 * <p>
 * 게시판·Q&A와 달리 스킬태그·채택 개념이 없어 {@code skillTagsJson} 파라미터를 받지 않는다.
 * </p>
 */
@RestController
@RequestMapping("/voc")
@RequiredArgsConstructor
public class VocController {

    private final VocService vocService;
    private final ViewCountDedupService viewCountDedupService;

    @GetMapping
    public ResponseEntity<ApiResponse<BoardListResponse>> getAllVocs(
            @RequestParam(value = "searchType", required = false) String searchType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "고객의 소리 조회 성공",
                vocService.getAllVocs(searchType, keyword, sortType, page, size)));
    }

    @GetMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<BoardResponse>> getVoc(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "고객의 소리 상세 조회 성공",
                vocService.getVoc(userSq, boardSq)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createVoc(
            @AuthenticationPrincipal Long userSq,
            @ModelAttribute BoardRequest boardRequest) {

        boardRequest.setUserSq(userSq);
        vocService.createVoc(boardRequest);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "고객의 소리가 등록되었습니다.", null));
    }

    @PutMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<NullType>> updateVoc(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq,
            @ModelAttribute BoardRequest boardRequest) {

        boardRequest.setUserSq(userSq);
        vocService.updateVoc(boardRequest, boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "고객의 소리가 수정되었습니다.", null));
    }

    @PatchMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteVoc(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq) {

        vocService.deleteVoc(userSq, boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "고객의 소리가 삭제되었습니다.", null));
    }

    @PatchMapping("/{boardSq}/increment-view")
    public ResponseEntity<ApiResponse<NullType>> addViewCntVoc(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq,
            HttpServletRequest request) {

        if (viewCountDedupService.isFirstView("board", boardSq, userSq, request)) {
            vocService.addViewCnt(boardSq);
        }
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가 완료", null));
    }
}
