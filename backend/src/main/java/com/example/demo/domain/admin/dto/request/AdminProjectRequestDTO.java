package com.example.demo.domain.admin.dto.request;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminProjectRequestDTO {
	private String projectSq;
	private String projectStatus;  // 컬럼 추가 요청 필요
}
