package com.example.demo.domain.notification.service;



import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.notification.dto.request.NotificationRequest;
import com.example.demo.domain.notification.dto.response.NotificationModalResponse;
import com.example.demo.domain.notification.entity.NotificationEntity;
import com.example.demo.domain.notification.mapper.NotificationMapper;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
	
	private final NotificationMapper notificationMapper;

	public NotificationModalResponse createNotification(NotificationRequest request, Long userSq) {
		
		NotificationRequest.NotificationInfo info = request.getNotificationInfo();
		
		NotificationEntity entity = new NotificationEntity();
		entity.setUserSq(userSq);
		entity.setNotificationTypeCd(info.getNotificationTypeCd());
		entity.setNotificationTargetParentTypeCd(info.getNotificationTargetParentTypeCd());
		entity.setNotificationTargetSq(info.getNotificationTargetSq());
		entity.setNotificationTargetParentTypeCd(info.getNotificationTargetParentTypeCd());
		entity.setNotificationTargetParentSq(info.getNotificationTargetParentSq());
		entity.setNotificationTtl(info.getNotificationTtl());
		entity.setNotificationTxt(info.getNotificationTxt());
		entity.setNotificationIsReadYn("N");
		entity.setNotificationIsDeletedYn("N");
		return null;
	}

}
