package com.example.demo.domain.attendance.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyAttendanceResponse {

    private List<String> attendanceDates;
}