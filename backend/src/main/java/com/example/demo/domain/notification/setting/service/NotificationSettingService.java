package com.example.demo.domain.notification.setting.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.notification.setting.dto.request.NotificationSettingPatchRequestDTO;
import com.example.demo.domain.notification.setting.dto.response.NotificationSettingResponseDTO;
import com.example.demo.domain.notification.setting.mapper.NotificationSettingMapper;
import com.example.demo.domain.notification.setting.repository.NotificationCategory;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationSettingService {

    private final NotificationSettingMapper mapper;

    @Transactional
    public NotificationSettingResponseDTO get(Long userSq) {
        NotificationSettingResponseDTO s = mapper.selectSetting(userSq);
        if (s != null) return s;

        mapper.insertDefault(userSq);
        return mapper.selectSetting(userSq);
    }

    @Transactional
    public NotificationSettingResponseDTO patch(Long userSq, NotificationSettingPatchRequestDTO req) {
        get(userSq);

        mapper.patchSetting(userSq, req);
        return mapper.selectSetting(userSq);
    }

    @Transactional(readOnly = true)
    public boolean canReceive(Long userSq, Long notificationTargetTypeCd) {
        NotificationSettingResponseDTO s = mapper.selectSetting(userSq);
        if (s == null) return true;

        if (!"Y".equals(s.getAllNoticeYn())) return false;

        NotificationCategory category = NotificationCategory.fromTargetTypeCd(notificationTargetTypeCd);

        return switch (category) {
            case COMMENT -> "Y".equals(s.getCommentNoticeYn());
            case RECRUIT -> "Y".equals(s.getRecruitNoticeYn());
            case SCRAP_COMPANY -> "Y".equals(s.getScrapCompanyNoticeYn());
            default -> true;
        };
    }
}