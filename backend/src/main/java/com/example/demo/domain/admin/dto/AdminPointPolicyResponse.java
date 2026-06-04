package com.example.demo.domain.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointPolicyResponse {

    private Long pointPolicySq;
    private Integer attendancePoint;
    private Integer streakPoint;
    private Integer eventPoint;
    private String autoPaymentYn;
    private String duplicateBlockYn;
    private String manualAdjustYn;
    private String regDt;
    private String modDt;
}