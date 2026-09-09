package com.example.demo.domain.mypage.service;

import com.example.demo.domain.mypage.dto.request.ScheduleRequestDTO;
import com.example.demo.domain.mypage.dto.response.ScheduleResponseDTO;
import com.example.demo.domain.mypage.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public List<ScheduleResponseDTO> getScheduleList(ScheduleRequestDTO requestDto) {
        return scheduleRepository.getScheduleList(requestDto);
    }

    @Transactional
    public void registerSchedule(ScheduleRequestDTO requestDto) {
        // 비즈니스 로직 예외 발생 시 GlobalExceptionHandler가 처리함
        if (requestDto.getScheduleTtl() == null || requestDto.getScheduleTtl().isEmpty()) {
            throw new IllegalArgumentException("일정 제목은 필수 입력 항목입니다.");
        }
        scheduleRepository.registerSchedule(requestDto);
    }

    @Transactional
    public void modifySchedule(ScheduleRequestDTO requestDto) {
        scheduleRepository.modifySchedule(requestDto);
    }

    @Transactional
    public void deleteSchedule(Long scheduleSq, Long userSq) {
        scheduleRepository.deleteSchedule(scheduleSq, userSq);
    }
}