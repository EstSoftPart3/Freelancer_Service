package com.example.demo.domain.notification.setting.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.notification.setting.dto.request.NotificationSettingPatchRequestDTO;
import com.example.demo.domain.notification.setting.dto.response.NotificationSettingResponseDTO;

@Mapper
public interface NotificationSettingMapper {
    NotificationSettingResponseDTO selectSetting(@Param("userSq") Long userSq);
    int insertDefault(@Param("userSq") Long userSq);
    int patchSetting(@Param("userSq") Long userSq, @Param("req") NotificationSettingPatchRequestDTO req);
    
}