package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarPostionEvnt;
import com.example.demo.domain.calendar.mapper.rows.ProjectDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CalendarPositionMapper {
    void insert(CalendarPostionEvnt calendarPostionEvnt);
    ProjectDetailRow findProjectDetailByScheduleSq(@Param("scheduleSq") Long scheduleSq);
}