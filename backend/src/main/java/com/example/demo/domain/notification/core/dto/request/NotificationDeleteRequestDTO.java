package com.example.demo.domain.notification.core.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder
public class NotificationDeleteRequestDTO {
	private List<Long> notificationSqList;

    private Long deleteStatus;
    
    
}
