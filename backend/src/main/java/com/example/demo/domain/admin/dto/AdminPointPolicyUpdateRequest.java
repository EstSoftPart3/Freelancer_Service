package com.example.demo.domain.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointPolicyUpdateRequest {

    private Integer attendancePoint;
    private Integer streakPoint;
    private Integer eventPoint;
    private String autoPaymentYn;
    private String duplicateBlockYn;
    private String manualAdjustYn;
}