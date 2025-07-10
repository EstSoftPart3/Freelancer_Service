package com.example.demo.domain.project.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CorporateApplicantDTO {
    private Long applicationSq;
    private String companyNm;
    private String memberType; // "기업"
    private LocalDateTime appDt;
    private LocalDateTime readResumeDt;
    private LocalDateTime interviewDt;
    private String appStatus;
}
