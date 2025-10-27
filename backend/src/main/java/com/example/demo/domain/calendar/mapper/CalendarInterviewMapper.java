package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarInterviewEvnt;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CalendarInterviewMapper {
    void insert(CalendarInterviewEvnt calendarInterviewEvnt);
}
