package com.example.demo.domain.mypage.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.mypage.dto.request.ScheduleRequestDTO;
import com.example.demo.domain.mypage.dto.response.ScheduleResponseDTO;

@Mapper
public interface ScheduleMapper {
    List<ScheduleResponseDTO> selectScheduleList(ScheduleRequestDTO requestDto);

    int insertSchedule(ScheduleRequestDTO requestDto);

    int updateSchedule(ScheduleRequestDTO requestDto);

    void deleteSchedule(Long scheduleSq, Long userSq);

}