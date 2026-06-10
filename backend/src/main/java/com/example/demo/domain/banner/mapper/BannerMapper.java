package com.example.demo.domain.banner.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.banner.dto.request.BannerCreateRequest;
import com.example.demo.domain.banner.dto.request.BannerUpdateRequest;
import com.example.demo.domain.banner.dto.response.ActiveBannerResponse;
import com.example.demo.domain.banner.dto.response.BannerResponse;

@Mapper
public interface BannerMapper {

    int insert(
            @Param("request") BannerCreateRequest request,
            @Param("bannerImageFileSq") Long bannerImageFileSq,
            @Param("bannerIsActiveYn") String bannerIsActiveYn,
            @Param("linkTargetBlankYn") String linkTargetBlankYn);

    Long countBanners(@Param("keyword") String keyword);

    List<BannerResponse> findAllBanners(
            @Param("keyword") String keyword,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("offset") Long offset,
            @Param("size") Long size);

    BannerResponse selectById(@Param("bannerSq") Long bannerSq);

    List<ActiveBannerResponse> selectActive();

    int update(
            @Param("bannerSq") Long bannerSq,
            @Param("request") BannerUpdateRequest request,
            @Param("bannerImageFileSq") Long bannerImageFileSq,
            @Param("bannerIsActiveYn") String bannerIsActiveYn,
            @Param("linkTargetBlankYn") String linkTargetBlankYn);

    int softDelete(@Param("bannerSq") Long bannerSq);

    int toggleActive(@Param("bannerSq") Long bannerSq);

    int deactivateExpired();

    int incrementClickCount(@Param("bannerSq") Long bannerSq);
}
