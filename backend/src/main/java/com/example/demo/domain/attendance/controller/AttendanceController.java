package com.example.demo.domain.attendance.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.domain.attendance.dto.MonthlyAttendanceResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.attendance.dto.AttendanceCheckResponse;
import com.example.demo.domain.attendance.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mypage/attendance")
    public ResponseEntity<AttendanceCheckResponse> checkAttendance(
    		@AuthenticationPrincipal Long userSq) {

        boolean checked = attendanceService.checkAttendance(userSq);

        AttendanceCheckResponse response = new AttendanceCheckResponse(
                checked,
                checked ? "출석체크가 완료되었습니다." : "오늘은 이미 출석체크가 완료되었습니다."
        );

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/mypage/attendance")
    public ResponseEntity<MonthlyAttendanceResponse> getMonthlyAttendance(
            @AuthenticationPrincipal Long userSq,
            @RequestParam int year,
            @RequestParam int month) {

        List<String> attendanceDates =
                attendanceService.getMonthlyAttendanceDates(userSq, year, month);

        MonthlyAttendanceResponse response =
                new MonthlyAttendanceResponse(attendanceDates);

        return ResponseEntity.ok(response);
    }
}