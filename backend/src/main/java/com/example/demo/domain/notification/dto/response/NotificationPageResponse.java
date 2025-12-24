package com.example.demo.domain.notification.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NotificationPageResponse {

    private List<NotificationResponse> notifications;

    private int page;          // 현재 페이지 (1부터)
    private int size;          // 페이지당 개수
    private long totalCount;   // 전체 알림 개수
    private int totalPages;    // 전체 페이지 수
    private boolean hasNext;   // 다음 페이지 존재 여부

    @Builder
    public NotificationPageResponse(
            List<NotificationResponse> notifications,
            int page,
            int size,
            long totalCount,
            int totalPages,
            boolean hasNext
    ) {
        this.notifications = notifications;
        this.page = page;
        this.size = size;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
        this.hasNext = hasNext;
    }
}
