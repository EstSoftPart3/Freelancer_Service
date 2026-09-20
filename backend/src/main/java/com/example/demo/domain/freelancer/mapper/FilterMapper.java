package com.example.demo.domain.freelancer.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.example.demo.domain.freelancer.dto.response.FilterOptionResponseDto;

@Mapper
public interface FilterMapper {
    List<FilterOptionResponseDto.Option> selectAddressOptions();
    List<FilterOptionResponseDto.Option> selectCareerOptions();
    List<FilterOptionResponseDto.Option> selectJobStatusOptions();
    List<FilterOptionResponseDto.Option> selectSkillOptions();
}