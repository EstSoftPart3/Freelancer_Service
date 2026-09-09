package com.example.demo.domain.mypage.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResumeSkillDataResponse {
	private Long skillTagSq;
    private Long parentSkillTagSq;
    private String skillTagNm;
}
