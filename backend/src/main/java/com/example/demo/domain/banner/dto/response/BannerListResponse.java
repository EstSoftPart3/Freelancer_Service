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
