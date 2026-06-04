package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointResponse {

    private Long pointSq;
    private Long userSq;
    private Integer pointAmount;
    private LocalDateTime pointCreateAtDt;
    private LocalDateTime pointUpdatedAtDt;
}