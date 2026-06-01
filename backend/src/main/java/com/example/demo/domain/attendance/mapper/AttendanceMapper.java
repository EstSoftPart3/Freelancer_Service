package com.example.demo.domain.attendance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AttendanceMapper {

	// 오늘 이미 출석했는지 확인
    int countTodayAttendance(@Param("userSq") Long userSq);

    // 오늘 출석 기록 등록
    int insertAttendance(@Param("userSq") Long userSq);
}