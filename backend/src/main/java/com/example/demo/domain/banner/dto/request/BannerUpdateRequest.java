package com.example.demo.domain.banner.dto.request;

import java.time.LocalDateTime;

public record BannerUpdateRequest(
        String bannerTitle,
        String bannerLinkUrl,
        String linkTargetBlankYn,
        Integer displayOrder,
        LocalDateTime startDtm,
        LocalDateTime endDtm,
        Boolean isActive) {
}

/*
 * ========== 학습용 설명 ==========
 *
 * // PATCH /admin/banners/{bannerSq} 수정 요청 (Day2~ Service/XML)
 * // 필드가 String, Integer, Boolean 객체 타입 → null = "이 항목은 수정 안 함"
 * // boolean 이 아닌 Boolean: null(미전송) vs true/false 구분
 * public record BannerUpdateRequest(
 *         String bannerTitle,
 *         String bannerLinkUrl,
 *         String linkTargetBlankYn,
 *         Integer displayOrder,
 *         LocalDateTime startDtm,
 *         LocalDateTime endDtm,
 *         Boolean isActive) {
 * }
 */
