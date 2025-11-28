package com.example.demo.domain.notification.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.notification.dto.NotificationDTO;
import com.example.demo.domain.notification.dto.response.NotificationResponse;

@Mapper
public interface NotificationMapper {
	
	void insert(NotificationDTO dto);	
	
	NotificationDTO findBySq(@Param("notificationSq") Long notificationSq);
	
	void updateReadStatus(@Param("notificationSq") Long notificationSq,
						  @Param("notificationIsReadYn") String isRead);
	
	void updateDeleteStatus(@Param("notificationSq") Long notificationSq,
						  @Param("notificationIsDeletedYn") String isDeleted,
						  @Param("notificationDeletedAtDtm") LocalDateTime deletedAt);
	
	List<NotificationResponse> findUnreadByUser(@Param("userSq") Long userSq);
	
	List<NotificationResponse> findAllByUser(@Param("userSq") Long userSq,
										@Param("cursor") Long cursor,
										@Param("size") int size);
	
}
