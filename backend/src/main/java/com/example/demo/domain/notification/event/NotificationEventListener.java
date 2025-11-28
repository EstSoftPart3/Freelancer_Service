package com.example.demo.domain.notification.event;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.example.demo.domain.notification.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

	private final SseEmitterManager emitterManager;
	
	@EventListener
	@Async
	public void handleNotificationEvent(NotificationEvent event) {
		emitterManager.sendToUser(event.getUserSq(), event.getNotification());
	}
}
