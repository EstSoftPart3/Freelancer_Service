package com.example.demo.domain.attendance.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.attendance.mapper.AttendanceMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceMapper attendanceMapper;

    @Override
    @Transactional
    public boolean checkAttendance(Long userSq) {

        int count = attendanceMapper.countTodayAttendance(userSq);

        if (count > 0) {
            return false;
        }

        attendanceMapper.insertAttendance(userSq);

        return true;
    }
}