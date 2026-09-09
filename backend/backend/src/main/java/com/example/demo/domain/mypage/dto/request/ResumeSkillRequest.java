package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class ResumeSkillRequest {
	private Long skillTagSq;   // 기술 태그 순번
	private String skillTagNm; // 기술 태그 이름
	
	 public ResumeSkillRequest(Long skillTagSq) {
	        this.skillTagSq = skillTagSq;
	    }
}
