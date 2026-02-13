package com.example.demo.domain.user.controller;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.TokenDTO;
import com.example.demo.domain.user.dto.request.LoginRequestDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.LoginService;
import com.example.demo.domain.user.service.LoginService.LoginResultDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestController
@RequiredArgsConstructor
public class LoginController {

        private final LoginService loginService;

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
                        @RequestBody LoginRequestDTO request) {

                LoginResultDTO result = loginService.login(request.getUserId(), request.getUserPw(),
                                request.getUserTypeCd(), request.isAutoLogin());
               
                
                TokenDTO tokens = result.getToken();
                LoginResponseDTO userInfo = result.getUserInfo();
                userInfo.setToken(tokens);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "로그인 성공", userInfo));
        }

        @PostMapping("/refresh-token")
        public ResponseEntity<ApiResponse<TokenDTO>> refreshToken(
                        @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

                if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다."));
                }

                String refreshToken = authorizationHeader.substring(7);

                TokenDTO newTokens = loginService.refreshToken(refreshToken);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "토큰 갱신 성공", newTokens));
        }

        @PostMapping("/me")
        public ResponseEntity<ApiResponse<LoginResponseDTO>> getMyInfo(
                        @AuthenticationPrincipal Long userSq) {

                LoginResponseDTO userInfo = loginService.getUserInfoByUserSq(userSq);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "내 정보 조회 성공", userInfo));
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout(
                        @AuthenticationPrincipal Long userSq) {

                // DB에서 userSq에 해당하는 리프레시 토큰 삭제
                loginService.deleteRefreshTokenByUserSq(userSq);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "로그아웃 성공", null));
        }
}
