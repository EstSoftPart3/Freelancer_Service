package com.example.demo.domain.interview.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewResponseDTO {
	// 인터뷰 순번
    private Long interviewSq;
    // 기업명
    private String companyNm;
    // 인터뷰 생성일시
    private LocalDateTime interviewCreatedAt;
    // 인터뷰 상태
    private String interviewStatus;
    // 인터뷰 요청 메세지
    private String interviewRequestTxt;
    // 유저 이름
    private String userNm;
}