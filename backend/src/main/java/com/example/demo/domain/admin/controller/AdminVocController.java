package com.example.demo.domain.admin.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.response.AdminBoardListResponseDTO;
import com.example.demo.domain.admin.service.AdminVocService;
import com.example.demo.domain.community.dto.response.BoardResponse;

import lombok.RequiredArgsConstructor;

/**
 * BO 고객의 소리 관리.
 *
 * <p>
 * 보호가 두 겹이다 — {@code SecurityConfigProd} 의 {@code /admin/**} URL 매칭과, 클래스에 붙은
 * {@code @PreAuthorize}. URL 만 믿으면 경로를 옮기는 순간 무방비가 된다({@code MethodSecurityConfig} 참조).
 * </p>
 */
@RestController
@RequestMapping("/admin/voc")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminVocController {

    private final AdminVocService adminVocService;

    /**
     * 목록. {@code answered} 는 3상태다 — 미지정(전체) / true(답변완료) / false(미답변).
     * 운영자가 매일 여는 화면이라 기본은 "미답변 먼저 보이는 최신순"이 되도록 FO 쪽에서 정렬을 건다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminBoardListResponseDTO>> getVocs(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "answered", required = false) Boolean answered,
            @RequestParam(value = "sortField", defaultValue = "createdAt") String sortField,
            @RequestParam(value = "sortOrder", defaultValue = "DESC") String sortOrder,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "고객의 소리 목록 조회 성공",
                adminVocService.getAdminVocs(keyword, answered, sortField, sortOrder, page, size)));
    }

    @GetMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<BoardResponse>> getVoc(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "고객의 소리 상세 조회 성공",
                adminVocService.getAdminVoc(userSq, boardSq)));
    }

    /** 답변 등록 — 문의자에게 알림(2607)이 나간다. */
    @PostMapping("/{boardSq}/answer")
    public ResponseEntity<ApiResponse<NullType>> createAnswer(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq,
            @RequestParam("ttl") String ttl,
            @RequestParam("description") String description) {

        adminVocService.createAnswer(userSq, boardSq, ttl, description);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "답변이 등록되었습니다.", null));
    }

    @DeleteMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteVoc(@PathVariable("boardSq") Long boardSq) {
        adminVocService.deleteVoc(boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "삭제되었습니다.", null));
    }
}
