package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.dto.response.CalendarViewDto;
import com.example.demo.domain.calendar.entity.ScheduleEvnt;
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
            ,@Param("contractTypeCd") Long contractTypeCd, @Param("jobTypeCd") Long jobTypeCd);
    UserDTO findByUser(@Param("userSq") Long userSq);
    void insert(ScheduleEvnt scheduleEvnt);
}
