package com.example.demo.domain.mypage.dto.request;

import java.time.LocalDate;

import lombok.Data;

@Data

  public class ResumeEducationRequest {
		private Long resumeSq;
	    private String educationSchoolNm;
	    private String educationMajorNm;
	    private LocalDate educationAdmissionDt;
	    private LocalDate educationGraduationDt;
	    private Long educationStatusCd;
	}





