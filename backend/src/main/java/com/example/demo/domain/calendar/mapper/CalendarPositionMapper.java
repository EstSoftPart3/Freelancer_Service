package com.example.demo.domain.calendar.mapper;

import com.example.demo.domain.calendar.entity.CalendarPostionEvnt;
import com.example.demo.domain.calendar.mapper.rows.ProjectDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CalendarPositionMapper {
    void insert(CalendarPostionEvnt calendarPostionEvnt);
    ProjectDetailRow findProjectDetailByScheduleSq(@Param("scheduleSq") Long scheduleSq);
    //소속 스크랩 취소 시 일정 삭제
    void deleteScrapCompanyProjectSchedule(@Param("userSq") Long userSq, @Param("companySq")Long companySq);
    //프로젝트 스크랩 취소 시 일정 삭제
    void deleteScrapProjectSchedule(@Param("userSq") Long userSq, @Param("projectSq")Long projectSq);
    // 동일(사용자+프로젝트) "활성(N)" 일정 존재 여부
    boolean existsActiveByUserAndProject(@Param("userSq") Long userSq, @Param("projectSq") Long projectSq);
    // 동일(사용자+프로젝트) "삭제(Y)" 일정 존재 여부
    boolean existsDeletedByUserAndProject(@Param("userSq") Long userSq, @Param("projectSq") Long projectSq);
    // 동일(사용자+프로젝트) 삭제(Y) → 복구(N)
    int restoreByUserAndProject(@Param("userSq") Long userSq, @Param("projectSq") Long projectSq);

}