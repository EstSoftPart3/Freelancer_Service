package com.example.demo.domain.point.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointHistoryResponse {

    private String pointTp;
    private int chgPoint;
    private int remPoint;
    private String pointRsn;
    private LocalDateTime regDt;
}