package com.example.demo.domain.calendar.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.calendar.dto.response.CalendarViewDto;
import com.example.demo.domain.calendar.dto.request.PersonalScheduleCreateRequest;
import com.example.demo.domain.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/calendar")
@RequiredArgsConstructor
public class CalendarController {
     private final CalendarService calendarService;

     @GetMapping("/evnts")
    public ResponseEntity<ApiResponse<List<CalendarViewDto>>> getCalendar(@AuthenticationPrincipal Long userSq, @RequestParam(required = false) Integer year,
                                                                          @RequestParam(required = false) Integer month, @RequestParam(required = false) Long contractTypeCd,
                                                                          @RequestParam(required = false) Long jobTypeCd){
         //값이 없으면  현재 달로 기본값
         YearMonth ym = (year == null || month == null) ? YearMonth.now(ZoneId.of("Asia/Seoul")) : YearMonth.of(year, month);

         LocalDate start = ym.atDay(1);
         LocalDate end = ym.atEndOfMonth();

         //면접 일정 조회도 추가해야함
         List<CalendarViewDto> calendarViewDtoList = calendarService.getCalendar(userSq,start,end,contractTypeCd,jobTypeCd);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"일정 조회 완료",calendarViewDtoList));
     }

     @PostMapping("/evnts")
    public ResponseEntity<ApiResponse<Long>> CreateSchedule(@RequestBody PersonalScheduleCreateRequest personalreq, @AuthenticationPrincipal Long userSq){
         Long scheduleSq = calendarService.createPersonalSchedule(userSq,personalreq);
         return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일정 등록 완료", scheduleSq));
     }


}
