package com.example.demo.domain.interview.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewReview {
    private Long interviewReviewSq;
    private Long userSq;
    // TBL_USER_M 조인 전용 — insert 시에는 쓰지 않는다.
    private String userNickname;
    private String companyNm;
    private String jobNm;
    private String careerLevel;
    private LocalDate interviewDt;
    // 콤마로 이어붙인 면접단계 문자열(예: "서류,코딩테스트,1차 기술면접"). 정규화된 자식 테이블을
    // 두기엔 신고·검색 요구가 없어 과한 설계라 문자열로 충분하다고 판단했다.
    private String interviewStages;
    private String questionEdt;
    private Integer difficultyStar;
    private String atmosphereEdt;
    private String resultCd;
    private Integer proposedSalary;
    private Integer interviewViewCnt;
    private String interviewIsDeletedYn;
    private LocalDateTime interviewCreatedAtDtm;
}
