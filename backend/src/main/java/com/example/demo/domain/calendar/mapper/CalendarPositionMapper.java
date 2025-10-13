package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarPostionEvnt;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CalendarPositionMapper {
    void insert(CalendarPostionEvnt calendarPostionEvnt);
}