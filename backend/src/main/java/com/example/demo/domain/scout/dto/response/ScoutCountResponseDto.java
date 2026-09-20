package com.example.demo.domain.scout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutCountResponseDto {
    private long totalCount;   // 전체 제안 건수
    private long readCount;    // 열람 (수락/거절 포함) 건수
    private long unreadCount;  // 미열람 건수
}