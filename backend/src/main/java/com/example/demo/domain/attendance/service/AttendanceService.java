package com.example.demo.domain.attendance.service;

import java.util.List;

public interface AttendanceService {

    boolean checkAttendance(Long userSq);
    
    List<String> getMonthlyAttendanceDates(Long userSq, int year, int month);
}