package com.example.demo.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.auth.dto.request.GoogleLoginRequestDTO;
import com.example.demo.domain.auth.service.AuthService;
import com.example.demo.domain.user.dto.UserDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    
    @PostMapping("/google/login")
    public ResponseEntity<UserDTO> googleLogin(@RequestBody GoogleLoginRequestDTO request) {
        UserDTO response = authService.googleLogin(request);
        return ResponseEntity.ok(response);
    }
}
