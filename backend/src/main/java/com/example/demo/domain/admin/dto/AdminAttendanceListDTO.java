package com.example.demo.domain.admin.dto;

import java.time.LocalDate;
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
public class AdminAttendanceListDTO {

    private Long attendanceSq;
    private Long userSq;
    private LocalDate attendanceDt;
    private LocalDateTime createdAtDtm;
}