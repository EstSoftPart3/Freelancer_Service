package com.example.demo.domain.notification.setting.repository;

import com.example.demo.domain.notification.setting.dto.request.NotificationSettingPatchRequestDTO;
import com.example.demo.domain.notification.setting.dto.response.NotificationSettingResponseDTO;

public interface NotificationSettingRepository {

    NotificationSettingResponseDTO findOrCreateDefault(Long userSq);

    void patch(Long userSq, NotificationSettingPatchRequestDTO req);

    /**
     * 알림 생성 시 수신 가능 여부 판정
     * @param userSq 수신자
     * @param notificationTargetTypeCd 알림 종류(=2200 코드)
     */
    boolean canReceive(Long userSq, Long notificationTargetTypeCd);
}
