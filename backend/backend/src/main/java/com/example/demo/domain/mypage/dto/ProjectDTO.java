package com.example.demo.domain.mypage.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectDTO {
    private Long projectSq;
    private String projectTtl;
    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;
    private int candidateCnt;
    private LocalDateTime createdAt;
    private Long requiredEducationCd;
    private Long developerGradeCd;
}
