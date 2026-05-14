package com.example.demo.domain.interview.dto.request;

import lombok.*;

@Getter
@NoArgsConstructor
public class InterviewRequestDTO {
	// 인터뷰 순번
	private Long interviewSq;
	// 소속 순번
    private Long companySq;
    // 유저 순번
    private Long userSq;
    // 소속 유저 순번
    private Long companyUserSq;
    // 인터뷰 요청 메세지
    private String interviewRequestTxt;
    // 인터뷰 상태
    private String interviewStatus;
}