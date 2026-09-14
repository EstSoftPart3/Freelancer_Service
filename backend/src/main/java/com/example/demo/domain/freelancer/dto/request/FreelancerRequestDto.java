package com.example.demo.domain.freelancer.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerRequestDto {
	
	private String skills;
	private Integer experience;
	private Integer page = 0;
	private Integer size = 10;

}
