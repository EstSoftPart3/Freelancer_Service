package com.example.demo.domain.mypage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResumeSkillPairResponse {
	private String parentSkillTagNm; // 대분류 (예: 언어, 프레임워크, 도구)
	private String childSkillTagNm;  // 소분류 (예: Java, Spring Boot)
}
