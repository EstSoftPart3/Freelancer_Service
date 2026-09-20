package com.example.demo.domain.freelancer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.freelancer.dto.response.FilterOptionResponseDto;
import com.example.demo.domain.freelancer.service.FilterService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:8504", allowCredentials = "true")
@RequestMapping("/v1/scout/filters")
@RequiredArgsConstructor
public class FilterController {

    private final FilterService filterService;

    @GetMapping
    public ResponseEntity<FilterOptionResponseDto> getScoutFilterOptions() {
        FilterOptionResponseDto response = filterService.getScoutFilterOptions();
        return ResponseEntity.ok(response);
    }
}