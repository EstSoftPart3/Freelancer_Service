package com.example.demo.domain.freelancer.dto.request;

import lombok.*;

@Getter
@NoArgsConstructor
public class FreelancerSearchRequestDTO {
	// 카테고리 (이름, 기술 스택)
    private String category;
    // 키워드
    private String keyword;   
}
