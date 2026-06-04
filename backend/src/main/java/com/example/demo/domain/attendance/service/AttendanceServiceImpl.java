package com.example.demo.domain.attendance.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.attendance.mapper.AttendanceMapper;
import com.example.demo.domain.point.service.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceMapper attendanceMapper;
    private final PointService pointService;

    @Override
    @Transactional
    public boolean checkAttendance(Long userSq) {

        int count = attendanceMapper.countTodayAttendance(userSq);

        if (count > 0) {
            return false;
        }

        attendanceMapper.insertAttendance(userSq);
        
        pointService.earnAttendancePoint(userSq);

        return true;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getMonthlyAttendanceDates(Long userSq, int year, int month) {
        return attendanceMapper.selectMonthlyAttendanceDates(userSq, year, month);
    }
}