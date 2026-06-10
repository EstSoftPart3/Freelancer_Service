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
