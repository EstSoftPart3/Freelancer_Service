package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.dto.request.PersonalScheduleUpdateRequest;
import com.example.demo.domain.calendar.dto.response.CalendarViewDto;
import com.example.demo.domain.calendar.entity.ScheduleEvnt;
import com.example.demo.domain.calendar.entity.SourceType;
import com.example.demo.domain.user.dto.UserDTO;
import lombok.Data;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Mapper
public interface CalendarMapper {
    List<CalendarViewDto> findCalendarEvents(@Param("userSq") Long userSq, @Param("startDt") LocalDate startDt, @Param("endDt") LocalDate endDt
            ,@Param("contractTypeCd") Long contractTypeCd, @Param("recruitJobPositionTypeCd") Long recruitJobPositionTypeCd, @Param("searchKeyword") String searchKeyword,
                                             @Param("calendarType") String calendarType);
    UserDTO findByUser(@Param("userSq") Long userSq);
    ScheduleEvnt findBySchedule(@Param("scheduleSq") Long scheduleSq);
    void insert(ScheduleEvnt scheduleEvnt);
    int updateScheduleSelective(@Param("userSq") Long userSq,
                                @Param("req") PersonalScheduleUpdateRequest req);
    int deleteSchedule(@Param("scheduleSq") Long scheduleSq);
}
