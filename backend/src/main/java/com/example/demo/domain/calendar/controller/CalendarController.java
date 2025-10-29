package com.example.demo.domain.calendar.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.calendar.dto.request.PersonalScheduleUpdateRequest;
import com.example.demo.domain.calendar.dto.response.CalendarDetailResDto;
import com.example.demo.domain.calendar.dto.response.CalendarViewDto;
import com.example.demo.domain.calendar.dto.request.PersonalScheduleCreateRequest;
import com.example.demo.domain.calendar.dto.response.ScheduleUpdateResDto;
import com.example.demo.domain.calendar.entity.SourceType;
import com.example.demo.domain.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Param;
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
                                                                          @RequestParam(required = false) Integer month, @RequestParam(required = false) Long recruitJobPositionTypeCd,
                                                                          @RequestParam(required = false) Long contractTypeCd, @RequestParam(required = false) String searchKeyword
                                                                            ,@RequestParam(required = false) String calendarType){
        //값이 없으면  현재 달로 기본값
        YearMonth ym = (year == null || month == null) ? YearMonth.now(ZoneId.of("Asia/Seoul")) : YearMonth.of(year, month);

        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        //면접 일정 조회도 추가해야함
        List<CalendarViewDto> calendarViewDtoList = calendarService.getCalendar(userSq,start,end,recruitJobPositionTypeCd,contractTypeCd,searchKeyword,calendarType);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"일정 조회 완료",calendarViewDtoList));
    }

    //일정 등록
    @PostMapping("/evnts")
    public ResponseEntity<ApiResponse<Long>> CreateSchedule(@RequestBody PersonalScheduleCreateRequest personalreq, @AuthenticationPrincipal Long userSq){
        Long scheduleSq = calendarService.createPersonalSchedule(userSq,personalreq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일정 등록 완료", scheduleSq));
    }

    //일정 조회 필터링
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<?>>> getSearchFilterInfo(@RequestParam("type") String type){
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"캘린더 필터 조회 완료", calendarService.fetchFilterInfos(type)));
    }

    //일정 수정
    @PatchMapping("/evnts/{scheduleSq}")
    public ResponseEntity<ApiResponse<ScheduleUpdateResDto>> updateSchedule(@PathVariable Long scheduleSq, @AuthenticationPrincipal Long userSq, @RequestBody PersonalScheduleUpdateRequest req){
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일정 수정 완료", calendarService.updateSchedule(scheduleSq,userSq,req)));
    }

    //일정 상세조회
    @GetMapping("/evnts/detail/{scheduleSq}")
    public ResponseEntity<ApiResponse<CalendarDetailResDto>> getEvntDetail(@AuthenticationPrincipal Long userSq, @PathVariable Long scheduleSq){
        CalendarDetailResDto calendarDetailResDto = calendarService.getEventDetail(userSq,scheduleSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"상세 조회 완료", calendarDetailResDto));
    }

    //일정 삭제
    @DeleteMapping("/evnts/{scheduleSq}")
    public ResponseEntity<ApiResponse<Long>> deletedSchedule(@AuthenticationPrincipal Long userSq, @PathVariable Long scheduleSq){
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"일정 삭제 완료", calendarService.deletedSchedule(userSq,scheduleSq)));

    }

}