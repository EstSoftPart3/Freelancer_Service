package com.example.demo.domain.banner.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ActiveBannerResponse {

    private Long bannerSq;
    private String bannerImageUrl;
    private String bannerLinkUrl;
    private String linkTargetBlankYn;
    private Integer displayOrder;
}

/*
 * ========== 학습용 설명 ==========
 *
 * // [Response DTO] FO GET /banners/active — Vue 메인 캐러셀용
 * // BannerResponse(9개)보다 필드 적음. 같은 DB라도 API마다 DTO 분리하는 예
 * @Getter
 * @Builder
 * public class ActiveBannerResponse {
 *
 *     private Long bannerSq;
 *     private String bannerImageUrl;
 *     private String bannerLinkUrl;
 *     private String linkTargetBlankYn;  // "Y"면 target="_blank"
 *     private Integer displayOrder;      // 캐러셀 순서
 * }
 */
