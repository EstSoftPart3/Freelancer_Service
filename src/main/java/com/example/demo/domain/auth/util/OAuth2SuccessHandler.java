package com.example.demo.domain.auth.util;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.service.UserService; // 유저 서비스
import com.example.demo.domain.user.util.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 1. OAuth2 인증 유저 정보 추출
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // 2. DB에서 유저 조회 (없으면 소셜 회원가입 처리 후 UserDTO 반환)
        UserDTO user = userService.getOrCreateSocialUser(email, oAuth2User.getAttributes());

        // 3. UserDTO 기반으로 Access Token 생성
        String accessToken = jwtProvider.createAccessToken(user);

        // 4. 프론트엔드 콜백 URL로 토큰 전달
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/callback")
                .queryParam("token", accessToken)
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}