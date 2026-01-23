package com.example.demo.domain.mypage.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectScrapSortDTO {
	private Long projectSq; 
	private LocalDateTime createdAt;
	private LocalDate recruitEndDt;
}
