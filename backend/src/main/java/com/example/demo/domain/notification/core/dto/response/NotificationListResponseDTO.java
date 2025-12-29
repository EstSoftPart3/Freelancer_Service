package com.example.demo.domain.notification.core.dto.response;

import java.util.List;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder
public class NotificationListResponseDTO {
    
    private List<NotificationResponseDTO> items;

    private long totalcount;
    private long unreadcount;
    private int page;
    private int size;
}
