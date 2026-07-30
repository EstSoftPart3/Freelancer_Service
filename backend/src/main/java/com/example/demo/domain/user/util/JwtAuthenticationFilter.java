package com.example.demo.domain.user.util;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    private static final List<String> EXCLUDE_URLS = List.of(
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
            "/api/check-nickname",
            "/api/company/verify",
            "/api/file",
            "/api/board",
            "/api/board/*/increment-view",
            "/api/qna",
            "/api/qna/*/increment-view",
            "/api/answer",
            "/api/answer/*/increment-view",
            "/api/notice",
            "/api/notice/*/increment-view",
            "/api/community/boards",
            "/api/community/best",
            // 주의: 이 목록은 접두사 매칭이라 "/api/community/boards" 가
            // "/api/community/board-categories" 를 덮지 않는다. 새 공개 엔드포인트는
            // SecurityConfig 의 permitAll 과 **이 목록 양쪽**에 넣어야 한다 —
            // 한쪽만 넣으면 설정상 공개인데 실제로는 401 이 나간다.
            "/api/community/board-categories",
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
            "/api/uploads",
            "/api/download",
            "/api/files",
            // ---------------- [추가] 관리자용 경로 ----------------
            "/api/admin/login",
            "/api/admin/refresh-token",
            // ---------------- [추가] Health Check 경로 ----------------
            "/api/actuator"

    // 여기에 더 추가 가능
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();

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
        return null;
    }

}
