package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarIndvdiEvnt;
import com.example.demo.domain.calendar.mapper.rows.PersonalDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CalendarIndvdiEvntMapper {
    void insert(CalendarIndvdiEvnt indvdiEvnt);
    int updateByScheduleSelective(@Param("scheduleSq") Long scheduleSq,
                                  @Param("memo") String memo,
                                  @Param("clearMemo") Boolean clearMemo);
    PersonalDetailRow findDetailByScheduleSq(@Param("scheduleSq") Long scheduleSq);
}
