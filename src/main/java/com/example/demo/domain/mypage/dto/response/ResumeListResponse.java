package com.example.demo.domain.mypage.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ResumeListResponse {
    private Long resumeSq;                 // 이력서 ID (PK)
    private String resumeTtl;              // 이력서 제목
    private String resumeNm;               // 이름
    private String resumeEmail;            // 이메일
    private String resumeGreetingTxt;      // 인사말 (한 줄 소개)
    private String resumeIsRepresentativeYn; // 대표 여부 (Y or N)
    private LocalDateTime resumeCreatedAtDtm; // 등록일자.


}
