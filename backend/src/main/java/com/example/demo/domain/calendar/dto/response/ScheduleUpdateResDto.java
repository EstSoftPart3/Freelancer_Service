package com.example.demo.domain.calendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleUpdateResDto {
    private Long scheduleSq;
    private String title;
    private LocalDate startDt;
    private LocalDate endDt;
    private String memo;
    private LocalDateTime calendarModifiedAtDtm;
}
