package com.example.demo.domain.attendance.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AttendanceMapper {

	// 오늘 이미 출석했는지 확인
	int countTodayAttendance(@Param("userSq") Long userSq);

	// 오늘 출석 기록 등록
	int insertAttendance(@Param("userSq") Long userSq);

	// 월별 출석일 조회
	List<String> selectMonthlyAttendanceDates(
			@Param("userSq") Long userSq, 
			@Param("year") int year,
			@Param("month") int month);
}