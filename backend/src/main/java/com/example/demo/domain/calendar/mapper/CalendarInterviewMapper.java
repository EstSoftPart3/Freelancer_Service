package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarInterviewEvnt;
import com.example.demo.domain.calendar.mapper.rows.InterviewDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CalendarInterviewMapper {
    void insert(CalendarInterviewEvnt calendarInterviewEvnt);
    InterviewDetailRow findInterviewDetailByScheduleSq(@Param("scheduleSq") Long scheduleSq);
}
