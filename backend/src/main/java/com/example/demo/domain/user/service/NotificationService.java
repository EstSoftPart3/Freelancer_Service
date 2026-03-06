package com.example.demo.domain.user.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.user.dto.request.NotificationBatchRequestDTO;
import com.example.demo.domain.user.dto.request.NotificationRequestDTO;
import com.example.demo.domain.user.dto.response.NotificationResponseDTO;
import com.example.demo.domain.user.mapper.NotificationMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;

    // 1. 알림 목록 조회
    public List<NotificationResponseDTO> getNotificationList(Long userSq) {
        return notificationMapper.selectNotificationList(userSq);
    }

    // 2. 안 읽은 알림 수 조회
    public int getUnreadCount(Long userSq) {
        return notificationMapper.selectUnreadNotificationCnt(userSq);
    }

    // 3. 공통 알림 발송 메서드
    @Transactional
    public void send(Long receiver, Long sender, Long type, String content, String url) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setReceiverUserSq(receiver);
        dto.setSenderUserSq(sender);
        dto.setNotificationTypeCd(type);
        dto.setNotificationContentTxt(content);
        dto.setNotificationTargetUrl(url);

        notificationMapper.insertNotification(dto);
    }

    // 4. 읽음 처리
    @Transactional
    public void markAsRead(Long notificationSq) {
        notificationMapper.updateNotificationRead(notificationSq);
    }

    // 5. 삭제 처리
    @Transactional
    public void removeNotification(Long notificationSq) {
        notificationMapper.deleteNotification(notificationSq);
    }

    // 알림 대량 등록 (Batch Insert)\
    @Transactional
    public void insertNotificationBatch(List<NotificationBatchRequestDTO> list) {
        notificationMapper.insertNotificationBatch(list);
    }

}