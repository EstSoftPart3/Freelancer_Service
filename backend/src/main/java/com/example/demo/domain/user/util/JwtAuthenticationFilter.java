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
            // SecurityConfigProd 는 POST /logout 을 permitAll 로 열어 뒀다. 하지만 이 필터가
            // 그보다 먼저 돌아서, 토큰이 만료된 채로 로그아웃을 누르면 컨트롤러에 닿기도 전에
            // 401 로 끊어 refresh token 삭제가 실행되지 않았다. 이 목록에 있어도 토큰이
            // 유효하면 아래에서 그대로 인증 정보를 세팅하니(바로 아래 분기 참고), 정상
            // 케이스(토큰이 살아 있을 때)는 지금과 동일하게 동작하고 만료 케이스만 통과시킨다.
            "/api/logout",
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
            // 이 목록은 AntPathMatcher 가 아니라 String.startsWith 로만 비교한다 — "*"는 와일드카드가
            // 아니라 리터럴 문자다. 그래서 "/api/board/*/increment-view" 같은 항목은 실제 URI
            // ("/api/board/123/increment-view")와 "*" 위치에서 어긋나 절대 매치되지 않는다.
            // 아래처럼 상위 경로("/api/board" 등)가 이미 그 하위 전부를 prefix 로 덮으므로
            // 결과적으로 무해했지만, 있어도 아무 일도 안 하는 죽은 항목이라 걷어냈다.
            // 새 공개 엔드포인트를 추가할 때 이 방식(별표를 넣어 "그 하위만" 공개하려는 시도)은
            // 통하지 않는다는 점에 주의 — SecurityConfig 의 permitAll 과 **이 목록 양쪽**에
            // 넣어야 하는 것은 여전하지만, 여기 넣는 값은 항상 리터럴 prefix 여야 한다.
            "/api/board",
            "/api/qna",
            "/api/answer",
            "/api/notice",
            "/api/community/boards",
            "/api/community/best",
            // 주의: 이 목록은 접두사 매칭이라 "/api/community/boards" 가
            // "/api/community/board-categories" 를 덮지 않는다. 새 공개 엔드포인트는
            // SecurityConfig 의 permitAll 과 **이 목록 양쪽**에 넣어야 한다 —
            // 한쪽만 넣으면 설정상 공개인데 실제로는 401 이 나간다.
            "/api/community/board-categories",
            // Phase2 게시판 재설계(2026-09) 신설 5종(CommunityBoardController) — board/qna와 같은 이유로 공개.
            "/api/career",
            "/api/tech",
            "/api/company",
            "/api/teamup",
            "/api/lounge",
            "/api/votes",
            "/api/interviews",
            "/api/affiliation",
            "/api/affiliation/address",
            "/api/projects/interviews",
            "/api/projects/forms",
            "/api/projects/filters",
            "/api/projects",
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
