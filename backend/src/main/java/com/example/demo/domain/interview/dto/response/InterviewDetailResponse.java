package com.example.demo.domain.interview.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDetailResponse {
    private Long interviewReviewSq;
    private Long userSq;
    private String userNickname;
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
    private Integer interviewViewCnt;
    private LocalDateTime interviewCreatedAtDtm;
}
