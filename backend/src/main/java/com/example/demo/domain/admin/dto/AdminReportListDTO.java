package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReportListDTO {
    private Long reportSq;
    private Long reporterSq;
    private String reporterNm;

    private Long targetTypeCd;
    private String targetTypeNm;
    private Long targetSq;
    private String targetTtl;

    private String targetDescription;

    private Integer originTypeCd;

    private Long reasonCd;
    private String reasonNm;
    private String content; // 신고자가 작성한 상세 사유

    private Long statusCd;
    private String statusNm;

    private String processDesc;

    private String processorNm;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}