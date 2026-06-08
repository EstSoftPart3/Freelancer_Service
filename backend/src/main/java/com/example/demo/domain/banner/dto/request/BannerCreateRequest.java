package com.example.demo.domain.banner.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BannerCreateRequest(
        @NotBlank(message = "배너 제목은 필수입니다.") String bannerTitle,
        String bannerLinkUrl,
        String linkTargetBlankYn,
        @NotNull(message = "노출 순서는 필수입니다.") Integer displayOrder,
        @NotNull(message = "노출 시작일시는 필수입니다.") LocalDateTime startDtm,
        @NotNull(message = "노출 종료일시는 필수입니다.") LocalDateTime endDtm,
        boolean isActive) {
}

/*
 * ========== 학습용 설명 ==========
 *
 * import java.time.LocalDateTime;
 *
 * // jakarta.* = Spring Boot 3 패키지명 (예전 javax.*)
 * // jakarta.persistence → JPA (@Entity). 【배너는 안 씀】
 * // jakarta.validation  → 입력 검증 (@NotBlank). 【JPA 아님, Controller 검증용】
 * import jakarta.validation.constraints.NotBlank;  // 빈 문자열이면 400
 * import jakarta.validation.constraints.NotNull;     // null 이면 400
 *
 * // record = 불변 Request DTO. getter는 bannerTitle() 형태로 자동 생성
 * // POST /admin/banners 등록 시 폼→서버. 이미지는 MultipartFile 로 따로 받음
 * public record BannerCreateRequest(
 *         @NotBlank(...) String bannerTitle,
 *         String bannerLinkUrl,
 *         String linkTargetBlankYn,   // "Y" 새탭 / "N". null이면 Service에서 "N"
 *         @NotNull(...) Integer displayOrder,
 *         @NotNull(...) LocalDateTime startDtm,
 *         @NotNull(...) LocalDateTime endDtm,
 *         boolean isActive) {        // Service가 "Y"/"N" 으로 바꿔 Mapper에 전달
 * }
 */
