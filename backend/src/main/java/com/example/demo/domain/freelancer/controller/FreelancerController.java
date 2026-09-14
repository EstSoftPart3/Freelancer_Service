package com.example.demo.domain.freelancer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.freelancer.dto.request.FreelancerRequestDto;
import com.example.demo.domain.freelancer.dto.response.FreelancerSearchResponse;
import com.example.demo.domain.freelancer.service.FreelancerService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:8504", allowCredentials = "true")
@RequestMapping("/v1/freelancers")
@RequiredArgsConstructor
public class FreelancerController {
	
	private final FreelancerService freelancerService;

    @GetMapping
    public ResponseEntity<FreelancerSearchResponse> searchFreelancers(
            @ModelAttribute FreelancerRequestDto requestDto) {

        FreelancerSearchResponse response = freelancerService.searchFreelancers(requestDto);
        return ResponseEntity.ok(response);
    }
}
