package com.example.demo.domain.mypage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumeSummary {
    private Long resumeId; // 이력서 ID
    private String title; // 이력서 제목
    private String registerDate; // 생성일자 (yyyy.MM.dd로 포맷된 문자열)
    private boolean isRepresentative; // 대표 여부 (0 또는 1을 boolean으로 변환)
}
