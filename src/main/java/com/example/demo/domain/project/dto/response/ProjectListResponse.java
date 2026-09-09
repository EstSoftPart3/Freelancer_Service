package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.domain.project.vo.ProjectSummary;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectListResponse {
	private Integer page;
    private Integer size;
    private Long totalCount;
    private Integer totalPages; 
    private List<ProjectSummary> projects;
}