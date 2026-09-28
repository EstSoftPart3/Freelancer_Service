package com.example.demo.domain.scout.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.scout.dto.response.ScrapResponseDto;
import com.example.demo.domain.scout.mapper.ScoutScrapMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScoutScrapService {
	
	private final ScoutScrapMapper scoutScrapMapper;
	
	@Transactional
    public ScrapResponseDto toggleScrap(Long userSq, Long resumeSq) {
        boolean isScrapped = scoutScrapMapper.existsScrap(userSq, resumeSq);

        if (isScrapped) {
            scoutScrapMapper.deleteScrap(userSq, resumeSq);
            return new ScrapResponseDto(false, "스크랩이 해제되었습니다.");
        } else {
            scoutScrapMapper.insertScrap(userSq, resumeSq);
            return new ScrapResponseDto(true, "스크랩에 추가되었습니다.");
        }
    }
}
