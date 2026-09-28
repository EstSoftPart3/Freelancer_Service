package com.example.demo.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.TokenDTO;
import com.example.demo.domain.user.dto.request.LoginRequestDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.LoginService;
import com.example.demo.domain.user.service.LoginService.LoginResultDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> adminLogin(
            @RequestBody LoginRequestDTO request) {

        // 서비스 호출 시 관리자 코드(303L)를 강제로 주입하여
        // 관리자가 아닌 계정(301, 302)은 로그인 단계에서 차단되도록 합니다.
        LoginResultDTO result = loginService.login(
                request.getUserId(),
                request.getUserPw(),
                303L // 관리자 전용 코드
        );

        TokenDTO tokens = result.getToken();
        LoginResponseDTO userInfo = result.getUserInfo();
        userInfo.setToken(tokens);

        // 프론트엔드(api.ts)의 구조에 맞춰 응답을 던집니다.
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "관리자 로그인 성공", userInfo));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenDTO>> refreshToken(@RequestBody TokenDTO tokenRequest) {
        try {
            TokenDTO newTokens = loginService.refreshToken(tokenRequest.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "토큰 재발급 성공", newTokens));
        } catch (Exception e) {
            // 여기서 401을 명시적으로 던져야 프론트가 '인증 만료'로 인식합니다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.of(HttpStatus.UNAUTHORIZED, "리프레시 토큰 만료. 다시 로그인하세요.", null));
        }
    }

    // FO의 LoginController.logout과 동일한 목적 — 이게 없으면 BO의 "로그아웃" 버튼은
    // 클라이언트 상태만 지울 뿐, DB의 refreshToken이 그대로 남아 재로그인 없이도
    // 계속 재발급이 가능한 상태로 남는다(2026-09-17 로그아웃 버그 원인 중 하나).
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal Long userSq) {
        loginService.deleteRefreshTokenByUserSq(userSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "로그아웃 성공", null));
    }
}