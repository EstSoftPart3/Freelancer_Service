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
