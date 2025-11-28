package com.example.demo.domain.notification.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NotificationPageResponse {
	
	private List<NotificationResponse> notifications;
	private Long nextCursor;
	private Boolean hasNext;
	
	@Builder
	public NotificationPageResponse(List<NotificationResponse> notifications, Long nextCursor, Boolean hasNext) {
		this.notifications = notifications;
		this.nextCursor = nextCursor;
		this.hasNext = hasNext;
	}

}
