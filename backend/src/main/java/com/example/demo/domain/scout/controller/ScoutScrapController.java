package com.example.demo.domain.scout.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.scout.dto.response.ScrapResponseDto;
import com.example.demo.domain.scout.service.ScoutScrapService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/scouts")
@RequiredArgsConstructor
public class ScoutScrapController {
	
	private final ScoutScrapService scoutScrapService;
	
	@PostMapping("/{resumeSq}/scrap")
    public ResponseEntity<ScrapResponseDto> toggleScrap(
            @PathVariable("resumeSq") Long resumeSq,
            @RequestAttribute("userSq") Long userSq // 로그인 유저 PK (인터셉터/시큐리티 등에서 전달)
    ) {
        ScrapResponseDto result = scoutScrapService.toggleScrap(userSq, resumeSq);
        return ResponseEntity.ok(result);
    }
	

}
