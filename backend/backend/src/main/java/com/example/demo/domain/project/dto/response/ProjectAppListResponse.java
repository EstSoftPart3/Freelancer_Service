package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.domain.project.vo.ApplicationSummary;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectAppListResponse {
	private int page;
	private int size;
	private int totalCount;
	private List<ApplicationSummary> applicationSummaries;
}
