package com.example.demo.domain.mypage.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.mypage.dto.request.ScheduleRequestDTO;
import com.example.demo.domain.mypage.dto.response.ScheduleResponseDTO;
import com.example.demo.domain.mypage.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mypage/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /**
     * 일정 목록 조회 (개인/기업 분기 포함)
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<ScheduleResponseDTO>>> getScheduleList(
            @AuthenticationPrincipal Long userSq,
            ScheduleRequestDTO requestDto) {

        requestDto.setUserSq(userSq);
        List<ScheduleResponseDTO> list = scheduleService.getScheduleList(requestDto);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일정 목록을 조회했습니다.", list));
    }

    /**
     * 일정 등록
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerSchedule(
            @AuthenticationPrincipal Long userSq,
            @RequestBody ScheduleRequestDTO requestDto) {

        requestDto.setUserSq(userSq);
        scheduleService.registerSchedule(requestDto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "일정이 등록되었습니다.", null));
    }

    /**
     * 일정 수정
     */
    @PutMapping("/modify")
    public ResponseEntity<ApiResponse<Void>> modifySchedule(
            @AuthenticationPrincipal Long userSq,
            @RequestBody ScheduleRequestDTO requestDto) {

        requestDto.setUserSq(userSq);
        scheduleService.modifySchedule(requestDto);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일정이 수정되었습니다.", null));
    }

    // 일정 삭제

    @DeleteMapping("/delete/{scheduleSq}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @AuthenticationPrincipal Long userSq,
            @PathVariable Long scheduleSq) {

        scheduleService.deleteSchedule(scheduleSq, userSq);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일정이 삭제되었습니다.", null));
    }
}