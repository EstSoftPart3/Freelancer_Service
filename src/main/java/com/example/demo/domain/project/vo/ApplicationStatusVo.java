package com.example.demo.domain.project.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusVo {
	private LocalDate readResumeDt;
	private LocalDate appDt;
	private LocalDateTime interviewDt;
	private String appStatus;
}
