package com.example.demo.domain.admin.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFreelancerProposalResponseDTO {
	private Long interviewSq;
	private Long companySq;
	private String companyNm;
	private String userNm;
	private String interviewStatus;
	private Long userSq;
	private LocalDate interviewCreatedAt;
	private LocalDate interviewModifiedAt;
	private String interviewRequestTxt;
	
}

