package com.example.demo.domain.project.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProjectReminderVo {
	
	private Long projectSq;
	private LocalDateTime recruitEndDt;
	private Long userSq;
	
}
