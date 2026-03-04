package com.example.demo.domain.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayStatsDTO {
	private String day;
	private Long visitors;
	private Long projects;
	private Long projectApplications;
	private Long companyApplications;
	private Long posts;
	private Long comments;
}
