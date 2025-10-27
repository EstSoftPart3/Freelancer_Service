package com.example.demo.domain.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InterviewScheduleSeeDto {
    private final Long applicationSq;
    private final Long projectSq;
    private final String projectTtl;

    private final Long companySq;
    private final String companyNm;

    private final Long addressSq;
    private final String address;
    private final String detailAddress;
    //나중에 일정등록 할때 지도 기능 추가 고려
//    private final Long zoneCode;
//    private final double latitude;
//    private final double longitude;

    private LocalDateTime interviewStartDt;
    private LocalDateTime interviewEndDt;

}
