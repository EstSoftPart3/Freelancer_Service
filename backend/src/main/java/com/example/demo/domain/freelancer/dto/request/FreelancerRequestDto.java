package com.example.demo.domain.freelancer.dto.request;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerRequestDto {
	
	private List<Long> addressCodeSq;
    private List<Long> careerCodeSq;
    private List<Long> skillSq;
    private List<Long> jobStatusCodeSq;
    private String searchKeyword;
	
	private String skills;
	private Integer experience;
	private Integer page = 0;
	private Integer size = 10;

}
