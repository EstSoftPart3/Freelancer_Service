package com.example.demo.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.response.AdminAttendanceListResponseDTO;
import com.example.demo.domain.admin.service.AdminAttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AdminAttendanceService adminAttendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminAttendanceListResponseDTO>> getAdminAttendanceList(
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        log.info("관리자 출석 내역 조회 page: {}, size: {}, startDate: {}, endDate: {}",
                page, size, startDate, endDate);

        AdminAttendanceListResponseDTO response =
                adminAttendanceService.getAdminAttendanceList(page, size, startDate, endDate);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "관리자 출석 내역 조회 성공", response)
        );
    }
}