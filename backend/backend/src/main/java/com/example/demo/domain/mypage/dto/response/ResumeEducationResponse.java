package com.example.demo.domain.mypage.dto.response;

import java.time.LocalDate;
import lombok.Data;

@Data
public class ResumeEducationResponse {
		 private Long educationSq;
		 private Long resumeSq;
		 private String educationSchoolNm;
		 private String educationMajorNm;
		 private LocalDate educationAdmissionDt;
		 private LocalDate educationGraduationDt;
		 private Long educationStatusCd;
			
	}


