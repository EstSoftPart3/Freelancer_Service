package com.example.demo.domain.sanction.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.sanction.dto.request.SanctionUserSearchRequestDto;
import com.example.demo.domain.sanction.dto.response.SanctionUserResponseDto;
import com.example.demo.domain.sanction.mapper.SanctionMapper;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SanctionService {
	
	private final SanctionMapper sanctionMapper;
	
    public SanctionUserResponseDto getSanctionedUsers(SanctionUserSearchRequestDto requestDto) {
		
        List<SanctionUserResponseDto.SanctionUserItem> userList = sanctionMapper.selectSanctionedUsers(requestDto);

        long totalCount = sanctionMapper.selectSanctionedUsersCount(requestDto);

        return SanctionUserResponseDto.builder()
                .userList(userList)
                .totalCount(totalCount)
                .currentPage(requestDto.getPage())
                .build();
    }
}
