package com.example.demo.domain.banner.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerListResponse {

    private List<BannerResponse> banners;
    private Long totalElements;
    private Long page;
    private Long size;
}

/*
 * ========== 학습용 설명 ==========
 *
 * import java.util.List;  // 여러 BannerResponse 를 담는 목록 타입
 *
 * import lombok.AllArgsConstructor;  // new BannerListResponse(banners, total, page, size)
 * import lombok.Builder;
 * import lombok.Getter;
 * import lombok.NoArgsConstructor;   // 인자 없는 생성자 (Builder/JSON 호환용)
 *
 * // [Response DTO] GET /admin/banners 목록 API 전체 응답
 * // BannerResponse = 배너 1건, BannerListResponse = 목록+페이징 껍데기
 * @Getter
 * @Builder
 * @NoArgsConstructor
 * @AllArgsConstructor
 * public class BannerListResponse {
 *
 *     // List<BannerResponse> = BannerResponse.java 한 건 타입을 여러 개 담음 (같은 패키지라 import 생략 가능)
 *     private List<BannerResponse> banners;
 *     private Long totalElements;  // 전체 건수
 *     private Long page;           // 현재 페이지
 *     private Long size;           // 페이지 크기
 * }
 */
