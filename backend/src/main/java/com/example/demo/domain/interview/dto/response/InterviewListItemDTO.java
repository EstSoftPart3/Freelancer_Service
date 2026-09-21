package com.example.demo.domain.interview.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewListItemDTO {
    private Long interviewReviewSq;
    private Long userSq;
    private String userNickname;
    private String companyNm;
    private String jobNm;
    private String careerLevel;
    private LocalDate interviewDt;
    private Integer difficultyStar;
    private String resultCd;
    private Integer interviewViewCnt;
    private LocalDateTime interviewCreatedAtDtm;
    // BO 목록 전용(삭제됨 뱃지) — FO 쿼리는 이 컬럼을 셀렉트하지 않아 항상 null로 온다.
    private String interviewIsDeletedYn;
}
