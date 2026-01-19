package com.example.demo.domain.user.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth/social") // 설계서의 공통 경로
@RequiredArgsConstructor
public class SocialLinkController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/link") // 설계서의 최종 경로: /api/auth/social/link
    public ApiResponse<?> linkAccount(@RequestBody Map<String, String> payload) {
        // 1. 프론트엔드(모달) payload와 키값 맞춤
        String email = payload.get("userEmail");
        String password = payload.get("userPw");
        String socialId = payload.get("socialId");

        try {
            // 2. 기존 계정 존재 여부 확인
        	UserDTO user = userService.findUserForSocialIntegration(email);
            if (user == null) {
                return ApiResponse.of(HttpStatus.BAD_REQUEST, "연동할 계정을 찾을 수 없습니다.", null);
            }

            if (!passwordEncoder.matches(password, user.getUserPw())) {
                return ApiResponse.of(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다.", null);
            }

            // 3. DB의 social_id 컬럼 업데이트 (기존 아이디 보존)
            int result = userService.linkSocialAccount(user.getUserId(), socialId);

            if (result > 0) {
                return ApiResponse.of(HttpStatus.OK, "success", "계정 통합 완료");
            } else {
                return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "fail", "연동 실패");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "error", "서버 오류");
        }
    }
}