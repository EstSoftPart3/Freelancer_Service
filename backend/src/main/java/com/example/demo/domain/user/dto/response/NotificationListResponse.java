package com.example.demo.domain.user.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationListResponse {
	private Integer page;
    private Integer size;
    private Long totalCount;
    private Integer totalPages; 
    private List<NotificationResponseDTO> notifications;

}
