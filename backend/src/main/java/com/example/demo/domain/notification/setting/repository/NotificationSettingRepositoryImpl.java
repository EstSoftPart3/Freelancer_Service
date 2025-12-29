package com.example.demo.domain.notification.setting.repository;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.notification.setting.dto.request.NotificationSettingPatchRequestDTO;
import com.example.demo.domain.notification.setting.dto.response.NotificationSettingResponseDTO;
import com.example.demo.domain.notification.setting.mapper.NotificationSettingMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class NotificationSettingRepositoryImpl implements NotificationSettingRepository {

    private final NotificationSettingMapper mapper;

    private static final String Y = "Y";
    private static final String N = "N";

    @Override
    @Transactional
    public NotificationSettingResponseDTO findOrCreateDefault(Long userSq) {
        NotificationSettingResponseDTO existing = mapper.selectSetting(userSq);
        if (existing != null) return existing;

        mapper.insertDefault(userSq);
        return mapper.selectSetting(userSq);
    }

    @Override
    @Transactional
    public void patch(Long userSq, NotificationSettingPatchRequestDTO req) {

        findOrCreateDefault(userSq);

        normalize(req);

        mapper.patchSetting(userSq, req);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReceive(Long userSq, Long notificationTargetTypeCd) {

        NotificationSettingResponseDTO s = mapper.selectSetting(userSq);

        if (s == null) return true;

        if (!"Y".equals(s.getAllNoticeYn())) {
            return false;
        }

        NotificationCategory category =
            NotificationCategory.fromTargetTypeCd(notificationTargetTypeCd);

        return switch (category) {
            case COMMENT -> "Y".equals(s.getCommentNoticeYn());
            case RECRUIT -> "Y".equals(s.getRecruitNoticeYn());
            case SCRAP_COMPANY -> "Y".equals(s.getScrapCompanyNoticeYn());
            case UNKNOWN -> true; // 정의되지 않은 타입은 허용 정책
        };
    }

    private void normalize(NotificationSettingPatchRequestDTO req) {
        if (req == null) return;
        req.setAllNoticeYn(normalizeYn(req.getAllNoticeYn()));
        req.setRecruitNoticeYn(normalizeYn(req.getRecruitNoticeYn()));
        req.setCommentNoticeYn(normalizeYn(req.getCommentNoticeYn()));
        req.setScrapCompanyNoticeYn(normalizeYn(req.getScrapCompanyNoticeYn()));
    }

    private String normalizeYn(String v) {
        if (v == null) return null;
        return Y.equals(v) ? Y : N;
    }
}