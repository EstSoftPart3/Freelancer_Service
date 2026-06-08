package com.example.demo.domain.banner.controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.banner.dto.request.BannerCreateRequest;
import com.example.demo.domain.banner.dto.request.BannerUpdateRequest;
import com.example.demo.domain.banner.dto.response.BannerListResponse;
import com.example.demo.domain.banner.dto.response.BannerResponse;
import com.example.demo.domain.banner.service.BannerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<BannerListResponse>> getBanners(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortField", defaultValue = "displayOrder") String sortField,
            @RequestParam(value = "sortOrder", defaultValue = "ASC") String sortOrder,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "배너 목록 조회 성공",
                bannerService.getBanners(keyword, sortField, sortOrder, page, size)));
    }

    @GetMapping("/{bannerSq}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBanner(
            @PathVariable("bannerSq") Long bannerSq) {

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "배너 조회 성공",
                bannerService.getBanner(bannerSq)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NullType>> createBanner(
            @RequestPart("request") @Valid BannerCreateRequest request,
            @RequestPart("image") MultipartFile image) {

        bannerService.createBanner(request, image);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "배너 등록 성공", null));
    }

    @PatchMapping(value = "/{bannerSq}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NullType>> updateBanner(
            @PathVariable("bannerSq") Long bannerSq,
            @RequestPart("request") @Valid BannerUpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        bannerService.updateBanner(bannerSq, request, image);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "배너 수정 성공", null));
    }

    @DeleteMapping("/{bannerSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteBanner(
            @PathVariable("bannerSq") Long bannerSq) {

        bannerService.deleteBanner(bannerSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "배너 삭제 성공", null));
    }

    @PatchMapping("/{bannerSq}/toggle-active")
    public ResponseEntity<ApiResponse<NullType>> toggleActive(
            @PathVariable("bannerSq") Long bannerSq) {

        bannerService.toggleActive(bannerSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "배너 활성 상태 변경 성공", null));
    }
}
