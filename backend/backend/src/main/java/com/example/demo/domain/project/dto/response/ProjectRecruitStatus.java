package com.example.demo.domain.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRecruitStatus {
	private Long allCount;
	private Long recruiting;
	private Long closed;
	private Long scheduled;
}
