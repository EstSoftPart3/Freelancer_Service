package com.example.demo.domain.project.dto.response;



import java.util.List;

import com.example.demo.domain.project.dto.PopularProjectDTO;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PopularProjectsResponse {
	
	private List<PopularProjectDTO> viewCount;
	private List<PopularProjectDTO> scrapCount;
	private List<PopularProjectDTO> applicantCount;
	
}
