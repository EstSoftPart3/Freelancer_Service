package com.example.demo.domain.auth.service;

import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.util.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
}
