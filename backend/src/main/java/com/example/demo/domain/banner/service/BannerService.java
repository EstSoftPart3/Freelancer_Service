package com.example.demo.domain.banner.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.banner.dto.request.BannerCreateRequest;
import com.example.demo.domain.banner.dto.request.BannerUpdateRequest;
import com.example.demo.domain.banner.dto.response.ActiveBannerResponse;
import com.example.demo.domain.banner.dto.response.BannerListResponse;
import com.example.demo.domain.banner.dto.response.BannerResponse;
import com.example.demo.domain.banner.mapper.BannerMapper;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.repository.InformationEditRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerMapper bannerMapper;
    private final FileStorageService fileStorageService;
    private final InformationEditRepository informationEditRepository;

    @Transactional(readOnly = true)
    public BannerListResponse getBanners(
            String keyword,
            String sortField,
            String sortOrder,
            Long page,
            Long size) {

        Long safePage = page == null || page < 1 ? 1L : page;
        Long safeSize = size == null || size < 1 ? 10L : size;
        Long offset = (safePage - 1) * safeSize;

        Long totalElements = bannerMapper.countBanners(keyword);
        List<BannerResponse> banners = bannerMapper.findAllBanners(
                keyword,
                sortField,
                sortOrder,
                offset,
                safeSize);

        return BannerListResponse.builder()
                .banners(banners)
                .totalElements(totalElements)
                .page(safePage)
                .size(safeSize)
                .build();
    }

    @Transactional(readOnly = true)
    public BannerResponse getBanner(Long bannerSq) {
        BannerResponse banner = bannerMapper.selectById(bannerSq);
        if (banner == null) {
            throw new IllegalArgumentException("존재하지 않는 배너입니다.");
        }
        return banner;
    }

    @Transactional(readOnly = true)
    public List<ActiveBannerResponse> getActiveBanners() {
        return bannerMapper.selectActive();
    }

    @Transactional
    public void incrementClickCount(Long bannerSq) {
        int rows = bannerMapper.incrementClickCount(bannerSq);
        if (rows != 1) {
            throw new IllegalArgumentException("존재하지 않는 배너입니다.");
        }
    }

    @Transactional
    public void createBanner(BannerCreateRequest request, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("배너 이미지는 필수입니다.");
        }

        UploadedFileDTO uploaded = fileStorageService.uploadFile(image);
        ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
                .originalName(uploaded.getOriginalName())
                .savedName(uploaded.getSavedName())
                .contentType(uploaded.getContentType())
                .size(uploaded.getSize())
                .build();
        informationEditRepository.saveFile(fileInfo);

        String activeYn = request.isActive() ? "Y" : "N";
        String linkTargetBlankYn = resolveLinkTargetBlankYn(request.linkTargetBlankYn());

        int rows = bannerMapper.insert(
                request,
                fileInfo.getFileSq(),
                activeYn,
                linkTargetBlankYn);

        if (rows != 1) {
            throw new IllegalStateException("배너 등록에 실패했습니다.");
        }
    }

    @Transactional
    public void updateBanner(Long bannerSq, BannerUpdateRequest request, MultipartFile image) {
        getBanner(bannerSq);

        Long bannerImageFileSq = null;
        if (image != null && !image.isEmpty()) {
            UploadedFileDTO uploaded = fileStorageService.uploadFile(image);
            ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
                    .originalName(uploaded.getOriginalName())
                    .savedName(uploaded.getSavedName())
                    .contentType(uploaded.getContentType())
                    .size(uploaded.getSize())
                    .build();
            informationEditRepository.saveFile(fileInfo);
            bannerImageFileSq = fileInfo.getFileSq();
        }

        String activeYn = request.isActive() == null
                ? null
                : (request.isActive() ? "Y" : "N");
        String linkTargetBlankYn = request.linkTargetBlankYn() == null
                ? null
                : resolveLinkTargetBlankYn(request.linkTargetBlankYn());

        int rows = bannerMapper.update(
                bannerSq,
                request,
                bannerImageFileSq,
                activeYn,
                linkTargetBlankYn);

        if (rows != 1) {
            throw new IllegalStateException("배너 수정에 실패했습니다.");
        }
    }

    @Transactional
    public void deleteBanner(Long bannerSq) {
        getBanner(bannerSq);

        int rows = bannerMapper.softDelete(bannerSq);
        if (rows != 1) {
            throw new IllegalStateException("배너 삭제에 실패했습니다.");
        }
    }

    @Transactional
    public int deactivateExpiredBanners() {
        return bannerMapper.deactivateExpired();
    }

    @Transactional
    public void toggleActive(Long bannerSq) {
        getBanner(bannerSq);

        int rows = bannerMapper.toggleActive(bannerSq);
        if (rows != 1) {
            throw new IllegalStateException("배너 활성 상태 변경에 실패했습니다.");
        }
    }

    private String resolveLinkTargetBlankYn(String value) {
        if (value == null || value.isBlank()) {
            return "N";
        }
        return "Y".equalsIgnoreCase(value) ? "Y" : "N";
    }
}
