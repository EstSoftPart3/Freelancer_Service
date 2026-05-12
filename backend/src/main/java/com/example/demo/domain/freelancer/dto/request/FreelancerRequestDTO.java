package com.example.demo.domain.freelancer.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class FreelancerRequestDTO {
	// 프리랜서 순번
	private Long freelancerSq;
	// 유저 이름
	private Long userSq;
	// 프리랜서 기술 스택
    private String freelancerSkill;
    // 프리랜서 등록 소개말
    private String freelancerGreetingTxt;
    // 프로필 이미지
    private FreelancerFileDTO profileImage;
    

}