package com.example.demo.domain.user.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.request.CompanyVerificationRequestDTO;
import com.example.demo.domain.user.service.CompanyVerificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyVerificationController {

    private final CompanyVerificationService verificationService;

    @PostMapping("/verify")
    public ApiResponse<Boolean> verifyCompany(@RequestBody CompanyVerificationRequestDTO request) {
        return verificationService.verifyCompany(request);
    }
}