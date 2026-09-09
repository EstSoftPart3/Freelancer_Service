package com.example.demo.domain.mypage.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleResponseDTO {
    private Long scheduleSq;
    private Long userSq;
    private String scheduleTtl;
    private String scheduleCnt;
    private String scheduleAllDayYn;
    private Long scheduleTypeCd;
    private Long projectSq;

    // FullCalendar 매핑용
    private String start;
    private String end;

    // 이력서 상세 조회를 위한 필드
    private Long resumeSq; // 이력서 번호
    private Long applicationSq; // 지원 내역 번호

    // 원본 데이터
    private String scheduleStartDtm;
    private String scheduleEndDtm;
}
