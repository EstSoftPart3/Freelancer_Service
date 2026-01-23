package com.example.demo.domain.user.util;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    private static final List<String> EXCLUDE_URLS = List.of(
    		// [추가] 정적 리소스 및 루트 경로 (500 에러 해결 핵심)
            "/api/",                // 루트 접속
            "/api/index.html",      // 메인 페이지
            "/api/static",          // 정적 폴더
            "/api/css",             // CSS
            "/api/js",              // JS
            "/api/img",             // 이미지
            "/api/vendor",          // 벤더 라이브러리 (문제의 구간)
            "/api/favicon.ico",     // 아이콘
            "/api/error",           // 에러 발생 시 리다이렉트되는 경로 (중요)
    		
            "/api/login",
            "/api/refresh-token",
            "/api/email/send-code",
            "/api/email/find/send-code",
            "/api/email/verify-code",
            "/api/find-id",
            "/api/reset-password",
            "/api/reset-password/verify",
            "/api/signup",
            "/api/check-id",
            "/api/company/verify",
            "/api/file",
            "/api/board",
            "/api/board/*/increment-view",
            "/api/qna",
            "/api/qna/*/increment-view",
            "/api/answer/*",
            "/api/answer/*/increment-view",
            "/api/affiliation",
            "/api/affiliation/*/increment-view",
            "/api/affiliation/address",
            "/api/projects/interviews",
            "/api/projects/forms",
            "/api/projects/filters",
            "/api/projects",
            "/api/projects/*/districts",
            "/api/projects/applications/interviews/*",
            "/api/mypage/resume",
            "/api/auth/social/link",
            "/api/auth/social/join"

    // 여기에 더 추가 가능
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        System.out.println("---- 필터 진입! 현재 요청 URI: " + uri);
        String token = resolveToken(request);

        // 인증 제외 경로 처리
        if (EXCLUDE_URLS.stream().anyMatch(uri::startsWith)) {
            if (token != null && jwtProvider.validateToken(token)) {
                try {
                    Long userSq = jwtProvider.getUserSqFromToken(token);
                    Long userTypeCd = jwtProvider.getUserTypeCdFromToken(token);

                    JwtAuthenticationToken authentication = new JwtAuthenticationToken(userSq, userTypeCd);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    // 토큰 오류 무시하고 통과 (로그 남기고 싶으면 여기서 처리)
                	logger.debug("Token validation failed for excluded URl : "+e.getMessage());
                }
            }

            filterChain.doFilter(request, response);
            return;
        }

        // 인증 필수 경로
        if (token == null || !jwtProvider.validateToken(token)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        try {
            Long userSq = jwtProvider.getUserSqFromToken(token);
            Long userTypeCd = jwtProvider.getUserTypeCdFromToken(token);

            JwtAuthenticationToken authentication = new JwtAuthenticationToken(userSq, userTypeCd);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
        	logger.debug("Autnetication faled : "+ e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        Cookie[] cookies = request.getCookies();
        if(cookies != null) {
        	for(Cookie cookie : cookies) {
        		if("accessToken".equals(cookie.getName())) {
        			return cookie.getValue();
        		}
        	}
        }
        return null;
    }

}
