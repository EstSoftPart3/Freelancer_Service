package com.example.demo.domain.attendance.controller;

import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<AttendanceCheckResponse> checkAttendance() {

        Long userSq = 1L; // TODO: 로그인 사용자 정보에서 가져오도록 수정 예정

        boolean checked = attendanceService.checkAttendance(userSq);

        AttendanceCheckResponse response = new AttendanceCheckResponse(
                checked,
                checked ? "출석체크가 완료되었습니다." : "오늘은 이미 출석체크가 완료되었습니다."
        );

        return ResponseEntity.ok(response);
    }
}