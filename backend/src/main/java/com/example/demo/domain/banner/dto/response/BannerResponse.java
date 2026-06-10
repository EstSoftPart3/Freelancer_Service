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
