package com.example.demo.domain.notification.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.notification.dto.request.NotificationSettingUpdateRequest;
import com.example.demo.domain.notification.dto.response.NotificationSettingResponse;
import com.example.demo.domain.notification.mapper.NotificationSettingMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationSettingService {

    private final NotificationSettingMapper notificationSettingMapper;

    /**
     * 내 알림 설정 조회
     * - 설정이 없으면 기본값(Y,Y,Y,Y) 생성 후 다시 조회
     */
    @Transactional
    public NotificationSettingResponse getOrCreateMySetting(Long userSq) {

        NotificationSettingResponse setting = notificationSettingMapper.selectMySetting(userSq);

        if (setting == null) {
            notificationSettingMapper.insertDefaultSetting(userSq);
            setting = notificationSettingMapper.selectMySetting(userSq);
        }

        return setting;
    }

    /**
     * 내 알림 설정 변경
     * - row 없으면 기본값 생성 후
     * - 들어온 값만 업데이트(null은 유지)
     * - 변경된 값 다시 조회해서 반환
     */
    @Transactional
    public NotificationSettingResponse updateMySetting(Long userSq, NotificationSettingUpdateRequest req) {

        NotificationSettingResponse setting = notificationSettingMapper.selectMySetting(userSq);

        if (setting == null) {
            notificationSettingMapper.insertDefaultSetting(userSq);
        }

        notificationSettingMapper.updateMySetting(userSq, req);

        return notificationSettingMapper.selectMySetting(userSq);
    }

    /**
     * ✅ 내 알림 설정 기본값으로 초기화
     * - row 없으면 기본값 생성 후 반환
     * - row 있으면 (Y,Y,Y,Y)로 업데이트 후 반환
     */
    @Transactional
    public NotificationSettingResponse resetMySetting(Long userSq) {

        NotificationSettingResponse setting = notificationSettingMapper.selectMySetting(userSq);

        if (setting == null) {
            notificationSettingMapper.insertDefaultSetting(userSq);
        } else {
            notificationSettingMapper.resetMySetting(userSq);
        }

        return notificationSettingMapper.selectMySetting(userSq);
    }
}
