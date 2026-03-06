package com.example.demo.domain.community.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    private Long reportSq;
    private Long reportUserSq;
    private Long reportTargetTypeCd;
    private Long reportTargetSq;
    private Long reportReasonCd;
    private String reportContentTxt;
    private Long reportProcessStatusCd;
}
