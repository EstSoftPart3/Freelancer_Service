package com.example.demo.domain.scout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ScrapResponseDto {
	private boolean isScrapped; // 최종 스크랩 상태 (true: 등록됨, false: 해제됨)
    private String message;

}
