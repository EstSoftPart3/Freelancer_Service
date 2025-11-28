package com.example.demo.domain.notification.event;


import com.example.demo.domain.notification.dto.response.NotificationResponse;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class NotificationEvent {
	
	private final Long userSq;
	private final NotificationResponse notification;

}
