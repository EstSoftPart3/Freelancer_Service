package com.example.demo.domain.banner.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BannerResponse {

    private Long bannerSq;
    private String bannerTitle;
    private String bannerImageUrl;
    private Integer displayOrder;
    private LocalDateTime startDtm;
    private LocalDateTime endDtm;
    @JsonProperty("isActive")
    private boolean isActive;
    private Integer bannerClickCount;
    private String bannerLinkUrl;
}

/*
 * ========== 학습용 설명 (아래는 위와 동일 코드 + 주석, 실행에는 위만 사용) ==========
 *
 * package com.example.demo.domain.banner.dto.response;
 *
 * import java.time.LocalDateTime;  // 날짜+시간. DB datetime(banner_start_dtm 등)과 매핑
 *
 * import lombok.Builder;  // BannerResponse.builder().bannerSq(1L)...build() 객체 생성
 * import lombok.Getter;   // getBannerSq(), getBannerTitle() 등 getter 자동 생성
 *
 * // [Response DTO] BO React /admin/banners API가 JSON으로 내려주는 "배너 1건" 모양 (9필드)
 * // DB 13컬럼 전체가 아님. React schema.ts 와 맞춤. Entity와 별개(API 약속).
 * @Getter
 * @Builder
 * public class BannerResponse {
 *
 *     private Long bannerSq;              // PK. DB banner_sq
 *     private String bannerTitle;         // DB banner_ttl → API 이름만 다름
 *     private String bannerImageUrl;      // DB는 file_sq, 화면은 URL (Day3 파일연동 후)
 *     private Integer displayOrder;       // DB banner_display_order
 *     private LocalDateTime startDtm;     // DB banner_start_dtm
 *     private LocalDateTime endDtm;       // DB banner_end_dtm
 *     private boolean isActive;           // DB "Y"/"N" → API true/false (Mapper에서 변환)
 *     private Integer bannerClickCount;   // DB banner_click_cnt
 *     private String bannerLinkUrl;       // DB banner_link_url
 * }
 */
