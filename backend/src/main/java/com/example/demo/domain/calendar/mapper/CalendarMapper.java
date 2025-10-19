package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.dto.request.PersonalScheduleUpdateRequest;
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
            ,@Param("contractTypeCd") Long contractTypeCd, @Param("recruitJobPositionTypeCd") Long recruitJobPositionTypeCd, @Param("searchKeyword") String searchKeyword);
    UserDTO findByUser(@Param("userSq") Long userSq);
    void insert(ScheduleEvnt scheduleEvnt);
    ScheduleEvnt findBySchedule(@Param("scheduleSq") Long scheduleSq);
    int updateScheduleSelective(@Param("userSq") Long userSq,
                                @Param("req") PersonalScheduleUpdateRequest req);
}
