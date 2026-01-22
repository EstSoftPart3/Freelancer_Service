package com.example.demo.domain.mypage.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.request.ScheduleRequestDTO;
import com.example.demo.domain.mypage.dto.response.ScheduleResponseDTO;
import com.example.demo.domain.mypage.mapper.ScheduleMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ScheduleRepository {

    private final ScheduleMapper scheduleMapper;

    public List<ScheduleResponseDTO> getScheduleList(ScheduleRequestDTO requestDto) {
        return scheduleMapper.selectScheduleList(requestDto);
    }

    public void registerSchedule(ScheduleRequestDTO requestDto) {
        scheduleMapper.insertSchedule(requestDto);
    }

    public void modifySchedule(ScheduleRequestDTO requestDto) {
        scheduleMapper.updateSchedule(requestDto);
    }

    public void deleteSchedule(Long scheduleSq, Long userSq) {
        scheduleMapper.deleteSchedule(scheduleSq, userSq);
    }
}