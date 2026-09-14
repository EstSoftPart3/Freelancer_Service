package com.example.demo.domain.freelancer.dto.response;

import java.util.List;

import com.example.demo.domain.freelancer.dto.PageInfoDto;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FreelancerSearchResponse {
	
	private Container data;
	
	@Getter
    @Builder
    public static class Container {
        private List<FreelancerResponseDto> freelancers;

        @JsonProperty("page_info")
        private PageInfoDto pageInfo;
    }

}
