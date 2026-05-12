package com.example.demo.domain.freelancer.dto.response;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FreelancerResponseDTO {
    // 프리랜서 순번
    private Long freelancerSq;
    // 유저 순번
    private Long userSq;
    // 유저 이름 - USER_M 에서 조회
    private String userNm;
    // 유저 이메일 - USER_M 에서 조회
    private String userEmail;
    // 프로필 이미지 - FILE 테이블에서 조회
    private String profileImgUrl;
    // 프리랜서 기술 스택
    private String freelancerSkill;
    // 프리랜서 등록 소개말
    private String freelancerGreetingTxt;
}