package com.example.demo.domain.interview.dto.request;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewReviewRequest {
    private Long userSq;
    private String companyNm;
    private String jobNm;
    private String careerLevel;
    private LocalDate interviewDt;
    private List<String> interviewStages;
    private String questionEdt;
    private Integer difficultyStar;
    private String atmosphereEdt;
    private String resultCd;
    private Integer proposedSalary;
}
