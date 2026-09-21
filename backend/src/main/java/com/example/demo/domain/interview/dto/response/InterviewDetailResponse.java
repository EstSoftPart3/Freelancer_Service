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
    // BO 상세 전용(삭제됨 뱃지) — FO getReview는 삭제된 글을 404로 막아 항상 "N"이다.
    private String interviewIsDeletedYn;
}
