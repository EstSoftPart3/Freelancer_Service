package com.example.demo.domain.freelancer.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerResponseDto {
	@JsonProperty("freelancer_sq")
    private Long freelancerSq;

    private String name;

    @JsonProperty("job_title")
    private String jobTitle;

    @JsonProperty("experience_years")
    private Integer experienceYears;

    private List<String> skills;

    @JsonProperty("profile_image_url")
    private String profileImageUrl;

    private String summary;
    
    private String address;
    
    @JsonProperty("detail_address")
    private String detailAddress;

    private String sigungu;
	

}
