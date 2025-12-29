package com.example.demo.domain.notification.core.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.notification.core.dto.request.NotificationDeleteRequestDTO;
import com.example.demo.domain.notification.core.dto.request.NotificationReadRequestDTO;
import com.example.demo.domain.notification.core.dto.response.NotificationListResponseDTO;
import com.example.demo.domain.notification.core.dto.response.NotificationResponseDTO;
import com.example.demo.domain.notification.core.entity.Notification;
import com.example.demo.domain.notification.core.mapper.NotificationMapper;
import com.example.demo.domain.notification.setting.service.NotificationSettingService;
import com.example.demo.domain.user.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 50;

    private static final Long DELETE_STATUS_NORMAL = 2301L; 
    private static final Long DELETE_STATUS_TRASH  = 2302L; 
    private static final Long DELETE_STATUS_PERMANENT = 2303L; 

    private static final String READ_Y = "Y";
    private static final String READ_N = "N";

    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;
    private final NotificationSettingService notificationSettingService;

    @Transactional(readOnly = true)
    public void validateUserForSse(Long userSq) {
        validateUser(userSq);
    }

    private void validateUser(Long userSq) {
        if (userSq == null) {
            throw new IllegalArgumentException("인증 정보가 없습니다.");
        }
        String userNm = userMapper.findUserNameByUserSq(userSq);
        if (userNm == null || userNm.isBlank()) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }
    }

    @Transactional(readOnly = true)
    public NotificationListResponseDTO getNotifications(Long userSq, Integer page, Integer size, Long deleteStatus) {
        validateUser(userSq);

        Long safeDeleteStatus = (deleteStatus == null )
                ? DELETE_STATUS_NORMAL
                : deleteStatus;

        int limit = (size == null || size <= 0) ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        int safePage = (page == null || page <= 0) ? 1 : page;
        int offset = (safePage - 1) * limit;

        long totalCount = notificationMapper.countNotifications(userSq, safeDeleteStatus);
        long unreadCount = notificationMapper.countUnreadNotifications(userSq, safeDeleteStatus);

        List<Notification> rows = notificationMapper.selectNotifications(userSq, safeDeleteStatus, limit, offset);
        if (rows == null) rows = Collections.emptyList();


        List<NotificationResponseDTO> list = rows.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());

        return NotificationListResponseDTO.builder()
                .items(list)
                .totalcount(totalCount)   
                .unreadcount(unreadCount) 
                .page(safePage)
                .size(limit)
                .build();
    }

    @Transactional(readOnly = true)
    public long getUnderCount(Long userSq) {
        validateUser(userSq);
        return notificationMapper.countUnderNotifications(userSq);
    }

    public void readNotifications(Long userSq, NotificationReadRequestDTO req) {
        validateUser(userSq);

        if (req == null || req.getNotificationSqList() == null || req.getNotificationSqList().isEmpty()) {
            return;
        }
        notificationMapper.updateReadYn(userSq, req.getNotificationSqList(), READ_Y);
    }

    public void deleteNotifications(Long userSq, NotificationDeleteRequestDTO req) {
        validateUser(userSq);

        if (req == null || req.getNotificationSqList() == null || req.getNotificationSqList().isEmpty()) {
            return;
        }

        notificationMapper.updateDeleteStatus(userSq, req.getNotificationSqList(), DELETE_STATUS_TRASH);
    }

    public void restoreNotifications(Long userSq, List<Long> sqList) {
        validateUser(userSq);

        if (sqList == null || sqList.isEmpty()) {
            return;
        }

        notificationMapper.updateDeleteStatus(userSq, sqList, DELETE_STATUS_NORMAL);
    }


    public void deleteNotificationsPermanently(Long userSq, List<Long> sqList) {
        validateUser(userSq);

        if (sqList == null || sqList.isEmpty()) {
            return;
        }

        notificationMapper.updateDeleteStatus(userSq, sqList, DELETE_STATUS_PERMANENT);
    }


    private NotificationResponseDTO toResponseDTO(Notification n) {

        return NotificationResponseDTO.builder()
                .notificationSq(n.getNotificationSq())
                .notificationTargetTypeCd(n.getNotificationTargetTypeCd())
                .notificationTargetSq(n.getNotificationTargetSq())
                .notificationTtl(n.getNotificationTtl())
                .notificationTxt(n.getNotificationTxt())
                .notificationIsReadYn(n.getNotificationIsReadYn())
                .build();
    }

    public void createNotification(
        Long receiverUserSq,
        Long notificationTargetTypeCd,
        Long notificationTargetSq,
        String notificationTtl,
        String notificationTxt
        ) {
        validateUser(receiverUserSq);

        if (!notificationSettingService.canReceive(receiverUserSq, notificationTargetSq)) {
        return;
        }
        
        Notification notification = Notification.builder()
                .userSq(receiverUserSq)
                .notificationTargetTypeCd(notificationTargetTypeCd)
                .notificationTargetSq(notificationTargetSq)
                .notificationTtl(notificationTtl)
                .notificationTxt(notificationTxt)
                .notificationIsReadYn(READ_N)
                .notificationDeleteStatus(DELETE_STATUS_NORMAL)
                .build();

        notificationMapper.insert(notification);
    }

    public void restoreNotifications(
        Long userSq, 
        NotificationDeleteRequestDTO req) 
    {
        validateUser(userSq);

        if (req == null || req.getNotificationSqList() == null || req.getNotificationSqList().isEmpty()) {
        return;
        }

        notificationMapper.updateDeleteStatus(
            userSq, 
            req.getNotificationSqList(), 
            DELETE_STATUS_NORMAL);
    }

    public void permanentDeleteNotifications(
        Long userSq, 
        NotificationDeleteRequestDTO req) 
    {
        validateUser(userSq);

        if (req == null || req.getNotificationSqList() == null || req.getNotificationSqList().isEmpty()) {
            return;
        }

    notificationMapper.updateDeleteStatus(userSq, req.getNotificationSqList(), DELETE_STATUS_PERMANENT);
    }

    @Transactional(readOnly = true)
    public NotificationListResponseDTO getUnreadNotifications(Long userSq, Integer page, Integer size, Long deleteStatus) {
        validateUser(userSq);

        Long safeDeleteStatus = (deleteStatus == null) ? DELETE_STATUS_NORMAL : deleteStatus;

        int limit = (size == null || size <= 0) ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        int safePage = (page == null || page <= 0) ? 1 : page;
        int offset = (safePage - 1) * limit;

        
        long totalCount = notificationMapper.countByReadYn(userSq, safeDeleteStatus, READ_N);

        List<Notification> rows = notificationMapper.selectByReadYn(userSq, safeDeleteStatus, READ_N, limit, offset);
        if (rows == null) rows = Collections.emptyList();

        List<NotificationResponseDTO> list = rows.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());

 
        return NotificationListResponseDTO.builder()
            .items(list)
            .totalcount(totalCount)
            .unreadcount(totalCount)
            .page(safePage)
            .size(limit)
            .build();
}
}
