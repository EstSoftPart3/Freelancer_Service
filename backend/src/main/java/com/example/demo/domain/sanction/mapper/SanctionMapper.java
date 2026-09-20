package com.example.demo.domain.sanction.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.sanction.dto.request.SanctionUserSearchRequestDto;
import com.example.demo.domain.sanction.dto.response.SanctionUserResponseDto;

@Mapper
public interface SanctionMapper {
	
    List<SanctionUserResponseDto.SanctionUserItem> selectSanctionedUsers(SanctionUserSearchRequestDto requestDto);

    long selectSanctionedUsersCount(SanctionUserSearchRequestDto requestDto);

}
