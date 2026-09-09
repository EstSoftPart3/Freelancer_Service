package com.example.demo.domain.project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationStatusRequest {
	private String status; // 지원 중, 불합격, 합격, 인터뷰 요청 중, 인터뷰 확정
}
