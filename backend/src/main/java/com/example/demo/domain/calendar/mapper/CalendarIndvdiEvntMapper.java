package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarIndvdiEvnt;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CalendarIndvdiEvntMapper {
    void insert(CalendarIndvdiEvnt indvdiEvnt);
}
