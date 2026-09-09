package com.example.demo.domain.mypage.dto.request;

import java.time.LocalDate;

import lombok.Data;

@Data
public class TrainingHistoryRequest {
	 private Long trainingSq;
	 private Long resumeSq;
	 private String trainingInstitutionNm;
	 private String trainingProgramNm;
	 private LocalDate trainingStartDt;
	 private LocalDate trainingEndDt;
}