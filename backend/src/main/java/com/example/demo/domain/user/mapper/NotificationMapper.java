package com.example.demo.domain.user.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.user.dto.request.NotificationBatchRequestDTO;
import com.example.demo.domain.user.dto.request.NotificationRequestDTO;
import com.example.demo.domain.user.dto.response.NotificationResponseDTO;

@Mapper
public interface NotificationMapper {

    // 1. 알림 목록 조회 (최신순)
    List<NotificationResponseDTO> selectNotificationList(Long receiverUserSq);

    // 2. 읽지 않은 알림 수 조회 (배지 노출용)
    int selectUnreadNotificationCnt(Long receiverUserSq);

    // 3. 알림 생성
    int insertNotification(NotificationRequestDTO requestDto);

    // 4. 알림 읽음 처리
    int updateNotificationRead(Long notificationSq);

    // 5. 알림 삭제 (논리 삭제)
    int deleteNotification(Long notificationSq);

    // 알림 대량 등록 (Batch Insert)
    void insertNotificationBatch(@Param("list") List<NotificationBatchRequestDTO> list);
}