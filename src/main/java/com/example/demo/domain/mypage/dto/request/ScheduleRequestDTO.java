package com.example.demo.domain.mypage.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleRequestDTO {
    private Long scheduleSq; // 일정 순번
    private Long userSq; // 사용자 순번
    private String scheduleTtl; // 일정 제목
    private String scheduleCnt; // 일정 내용
    private String scheduleStartDtm; // 시작 일시
    private String scheduleEndDtm; // 종료 일시
    private String scheduleAllDayYn; // 종일 여부
    private Long scheduleTypeCd; // 일정 유형 코드 (2401~2403)
    private Long projectSq; // 연관 프로젝트 순번

    // 검색용 필드
    private String searchType;
    private String searchKeyword;
    private String userType;
}