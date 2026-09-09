package com.example.demo.domain.project.vo;

import java.time.LocalDateTime;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationSummary {
	private Long applicationSq;
	private Long projectSq;
	private Long resumeSq;
	private String projectTitle;
	private String companyTitle;
	private String resumeTitle;
	private String applicantType;
	private Integer applicantCnt;
	private LocalDateTime appliedDt;
	private LocalDateTime readApplicationDt;
	private LocalDateTime interviewDt;
	private boolean isRecruitEnded;
}
