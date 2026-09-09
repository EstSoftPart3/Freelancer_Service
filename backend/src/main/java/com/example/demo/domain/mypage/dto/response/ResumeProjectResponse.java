package com.example.demo.domain.mypage.dto.response;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;


@Data
public class ResumeProjectResponse {
	    private Long projectHistorySq;         // 프로젝트 이력 순번 (PK)
	    private Long resumeSq;                 // 이력서 순번 (FK)
	    private String client;                 // 고객
	    private Long typeCd;                   // 구분 코드
	    private Long jobPositionTypeCd;        // 직무 구분 코드
	    private String task;                   // 업무단
	    @JsonFormat(pattern = "yyyy-MM-dd")
	    private LocalDate startDt;                // 프로젝트 시작일 
	    @JsonFormat(pattern = "yyyy-MM-dd")
	    private LocalDate endDt;                  // 프로젝트 종료일 (NULL 허용).
	}

