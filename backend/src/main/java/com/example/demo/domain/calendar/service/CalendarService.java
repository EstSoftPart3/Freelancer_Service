package com.example.demo.domain.calendar.service;

import com.amazonaws.services.kms.model.NotFoundException;
import com.example.demo.domain.calendar.dto.request.PersonalScheduleCreateRequest;
import com.example.demo.domain.calendar.dto.response.CalendarViewDto;
import com.example.demo.domain.calendar.entity.CalendarIndvdiEvnt;
import com.example.demo.domain.calendar.entity.ScheduleEvnt;
import com.example.demo.domain.calendar.mapper.CalendarIndvdiEvntMapper;
import com.example.demo.domain.calendar.mapper.CalendarMapper;
import com.example.demo.domain.calendar.mapper.CalendarPositionMapper;
import com.example.demo.domain.user.dto.UserDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CalendarService {
    private final CalendarMapper calendarMapper;
    private final CalendarIndvdiEvntMapper calendarIndvdiEvntMapper;
    private final CalendarPositionMapper calendarPositionMapper;

//    캘린더 일정 조회
    public List<CalendarViewDto> getCalendar(Long userSq, LocalDate start, LocalDate end,Long contractTypeCd,Long recruitJobPositionTypeCd){
        //사용자 조회
        UserDTO userInfo = calendarMapper.findByUser(userSq);
        Optional.ofNullable(userInfo).orElseThrow(() -> new NotFoundException("없는 회원입니다."));
        System.out.println(userSq);

        //사용자의 모든 캘린더 일정 조회
        List<CalendarViewDto> calendarViewDtoList = calendarMapper.findCalendarEvents(userSq,start, end, contractTypeCd, recruitJobPositionTypeCd);
        return calendarViewDtoList;
    }

//    캘린더 개인 일정 등록
    @Transactional
    public Long createPersonalSchedule(Long userSq, PersonalScheduleCreateRequest personalReq){
        // 공통일정 저장 (source_type = PERSONAL)
        ScheduleEvnt parent = personalReq.toParentEntity(userSq);
        calendarMapper.insert(parent);

        //개인 일정 자식 저장
        CalendarIndvdiEvnt child = personalReq.toChildEntity(parent.getScheduleSq(),userSq);
        calendarIndvdiEvntMapper.insert(child);

        return parent.getScheduleSq();
    }
}
