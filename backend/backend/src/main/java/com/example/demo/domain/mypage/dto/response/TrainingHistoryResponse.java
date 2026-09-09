package com.example.demo.domain.mypage.dto.response;

import java.time.LocalDate;

import lombok.Data;

@Data

public class TrainingHistoryResponse {
    private Long trainingSq;
    private Long resumeSq;
    private String trainingInstitutionNm;
    private String trainingProgramNm;
    private LocalDate trainingStartDt;
    private LocalDate trainingEndDt;
}