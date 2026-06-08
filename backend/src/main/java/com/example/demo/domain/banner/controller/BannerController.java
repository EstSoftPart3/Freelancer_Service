package com.example.demo.domain.banner.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.lang.model.type.NullType;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.banner.dto.response.ActiveBannerResponse;
import com.example.demo.domain.banner.service.BannerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    /** FO 메인 캐러셀 — GET /api/banners/active */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ActiveBannerResponse>>> getActiveBanners() {
        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "활성 배너 조회 성공",
                bannerService.getActiveBanners()));
    }

    /** FO 배너 클릭 수 +1 — PATCH /api/banners/{bannerSq}/increment-click */
    @PatchMapping("/{bannerSq}/increment-click")
    public ResponseEntity<ApiResponse<NullType>> incrementClickCount(
            @PathVariable("bannerSq") Long bannerSq) {

        bannerService.incrementClickCount(bannerSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "배너 클릭 수 증가 완료", null));
    }
}
