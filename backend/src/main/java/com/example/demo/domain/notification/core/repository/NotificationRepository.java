package com.example.demo.domain.notification.core.repository;

import java.util.List;

import com.example.demo.domain.notification.core.entity.Notification;

public interface NotificationRepository  {

    List<Notification> selectNotifications(Long userSq, Long deleteStatus, int limit, int offset);

    long countNotifications(Long userSq, Long deleteStatus);

    long countUnreadNotifications(Long userSq, Long deleteStatus);

    int updateReadYn(Long userSq, List<Long> sqList, String readYn);

    int updateDeleteStatus(Long userSq, List<Long> sqList, Long deleteStatus);

    int insert(Notification notification);
}
