package com.example.demo.domain.notification.core.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.notification.core.entity.Notification;
import com.example.demo.domain.notification.core.mapper.NotificationMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MyBatisNotificationRepository implements NotificationRepository{
    
    private final NotificationMapper mapper;

    @Override
    public List<Notification> selectNotifications(Long userSq, Long deleteStatus, int limit, int offset){
        return mapper.selectNotifications(userSq, deleteStatus, limit, offset);
    }

    @Override
    public long countNotifications(Long userSq, Long deleteStatus){
        return mapper.countNotifications(userSq, deleteStatus);
    }
    @Override
    public long countUnreadNotifications(Long userSq, Long deleteStatus){
        return mapper.countUnreadNotifications(userSq, deleteStatus);
    }
    @Override
    public int updateReadYn(Long userSq,List<Long> sqList, String readYn){
        return mapper.updateReadYn(userSq, sqList, readYn);
    }
    @Override 
    public int updateDeleteStatus(Long userSq, List<Long> sqList, Long deleteStatus){
        return mapper.updateDeleteStatus(userSq, sqList, deleteStatus);
    }
    
    @Override
    public int insert(Notification notification){
        return mapper.insert(notification);
    }

}
