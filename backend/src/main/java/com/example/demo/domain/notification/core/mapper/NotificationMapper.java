package com.example.demo.domain.notification.core.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.notification.core.entity.Notification;

@Mapper
public interface NotificationMapper {

    List<Notification> selectNotifications(
        @Param("userSq") Long userSq,
        @Param("deleteStatus") Long deleteStatus,
        @Param("limit") int limit,
        @Param("offset") int offset
    );
    
    long countNotifications(
        @Param("userSq") Long userSq,
        @Param("deleteStatus") Long deleteStatus
    );
    
    long countUnreadNotifications(
        @Param("userSq") Long userSq,
        @Param("deleteStatus") Long deleteStatus
    );

    long countUnderNotifications(
        @Param("userSq") Long userSq
    );

    int updateReadYn(
        @Param("userSq") Long userSq,
        @Param("sqList") List<Long> sqList,
        @Param("readYn") String readYn
    );

    int updateDeleteStatus(
        @Param("userSq") Long userSq,
        @Param("sqList") List<Long> sqList,
        @Param("deleteStatus") Long deleteStatus
    );

    int insert(Notification notification);

    long countByReadYn(
            @Param("userSq") Long userSq,
            @Param("deleteStatus") Long deleteStatus,
            @Param("readYn") String readYn
    );

    List<Notification> selectByReadYn(
            @Param("userSq") Long userSq,
            @Param("deleteStatus") Long deleteStatus,
            @Param("readYn") String readYn,
            @Param("limit") int limit,
            @Param("offset") int offset
    );
} 
