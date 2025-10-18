package com.example.demo.domain.calendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CalendarViewDto {
    // 공통
    private Long scheduleSq;
    private String sourceType; //personal, project
    private String title; //개인일정 제목 or 프로젝트 제목
    private Long projectSq;
    private Long companySq;
//    private Long scrapSq;
    private Date startDt;
    private Date endDt;

}
