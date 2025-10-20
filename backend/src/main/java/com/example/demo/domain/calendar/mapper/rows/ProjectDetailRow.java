package com.example.demo.domain.calendar.mapper.rows;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectDetailRow {
    private Long projectSq;
    private Long companySq;
    private String projectTtl;
    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;

}
