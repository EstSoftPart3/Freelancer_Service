package com.example.demo.domain.freelancer.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.freelancer.dto.response.FilterOptionResponseDto;
import com.example.demo.domain.freelancer.mapper.FilterMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FilterService {

    private final FilterMapper filterMapper;

    @Transactional(readOnly = true)
    public FilterOptionResponseDto getScoutFilterOptions() {
        List<FilterOptionResponseDto.Option> addresses = filterMapper.selectAddressOptions();
        List<FilterOptionResponseDto.Option> careers = filterMapper.selectCareerOptions();
        List<FilterOptionResponseDto.Option> jobStatuses = filterMapper.selectJobStatusOptions();
        List<FilterOptionResponseDto.Option> skills = filterMapper.selectSkillOptions();

        return FilterOptionResponseDto.builder()
                .addresses(addresses)
                .careers(careers)
                .jobStatuses(jobStatuses)
                .skills(skills)
                .build();
    }
}