package com.example.demo.domain.sanction.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.sanction.dto.request.SanctionUserSearchRequestDto;
import com.example.demo.domain.sanction.dto.response.SanctionUserResponseDto;
import com.example.demo.domain.sanction.service.SanctionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/bo/sanctions")
@RequiredArgsConstructor
public class SanctionController {
	
	private final SanctionService sanctionService;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getSanctionedUsers(@ModelAttribute SanctionUserSearchRequestDto requestDto) {
        SanctionUserResponseDto result = sanctionService.getSanctionedUsers(requestDto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", result);
        return ResponseEntity.ok(response);
    }

}
