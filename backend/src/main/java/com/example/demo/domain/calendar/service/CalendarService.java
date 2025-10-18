package com.example.demo.domain.calendar.service;

import com.amazonaws.services.kms.model.NotFoundException;
import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
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
    private final CommonCodeMapper commonCodeMapper;

    //    캘린더 일정 조회
    public List<CalendarViewDto> getCalendar(Long userSq, LocalDate start, LocalDate end,Long contractTypeCd,Long recruitJobPositionTypeCd,String searchKeyword){
        //사용자 조회
        UserDTO userInfo = calendarMapper.findByUser(userSq);
        Optional.ofNullable(userInfo).orElseThrow(() -> new NotFoundException("없는 회원입니다."));
        System.out.println(userSq);

        //사용자의 모든 캘린더 일정 조회
        List<CalendarViewDto> calendarViewDtoList = calendarMapper.findCalendarEvents(userSq,start, end, contractTypeCd, recruitJobPositionTypeCd,searchKeyword);
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

    //캘린더 필터링
    // 검색 필터에 들어갈 내용을 DB에서 조회
    public List<?> fetchFilterInfos(String type) {
        switch (type) {
            case "계약형태":
                return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.CONTRACT_TYPE.getCode());
            case "직무":
                return commonCodeMapper.findCommonCodeSqAndNmByParent(ParentCodeEnum.JOB_POSITION.getCode());
            default:
                throw new IllegalArgumentException("Unexpected value: " + type);
        }
    }
}
