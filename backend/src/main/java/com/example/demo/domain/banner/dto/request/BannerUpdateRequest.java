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
