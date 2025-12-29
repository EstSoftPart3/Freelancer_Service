package com.example.demo.domain.notification.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.notification.dto.request.NotificationSettingUpdateRequest;
import com.example.demo.domain.notification.dto.response.NotificationSettingResponse;

@Mapper
public interface NotificationSettingMapper {

    // 1) 내 알림 설정 조회
    NotificationSettingResponse selectMySetting(@Param("userSq") Long userSq);

    // 2) 없으면 기본값(Y,Y,Y,Y) 생성
    int insertDefaultSetting(@Param("userSq") Long userSq);

    // 3) 내 알림 설정 변경
    int updateMySetting(
            @Param("userSq") Long userSq,
            @Param("req") NotificationSettingUpdateRequest req
    );

    // 4) ✅ 기본값으로 초기화 (Y,Y,Y,Y)
    int resetMySetting(@Param("userSq") Long userSq);
}
