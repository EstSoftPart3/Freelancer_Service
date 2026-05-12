package com.example.demo.domain.project.dto.response;

import java.util.List;



import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectListResponseDto {
	private List<ProjectSummary> content;
	private int totalPages;
	private long totalElements;
	
	@Getter
	@Builder
	public static class ProjectSummary{
		private Long id; 	// No.
		private String title;	// 프로젝트명
		private String company;	// 의뢰 기업
		private String slaary; // 단가(월)
		private String startDt; // 수행 시작일
		private String endDt;	// 수행 종료일
		private String status; // 상태
	}
}
