package com.example.demo.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 현재 요청의 로그인 주체를 읽는 헬퍼.
 *
 * <p>
 * 컨트롤러는 {@code @AuthenticationPrincipal Long userSq} 로 받으면 되지만, 서비스·매퍼 계층에서
 * 같은 정보가 필요할 때 파라미터를 줄줄이 뚫는 대신 여기서 꺼낸다. 특히 목록 SQL의 비공개 필터는
 * {@code BoardService.getAllBoards} 를 부르는 네 컨트롤러(게시판·Q&A·공지·커뮤니티) 전부의
 * 시그니처를 바꾸지 않고 적용해야 해서 이 경로가 필요했다.
 * </p>
 *
 * <p>
 * principal 은 {@code JwtAuthenticationToken.getPrincipal()} 이 돌려주는 {@code Long userSq} 다.
 * 비로그인이면 {@code null} 이고, 그 경우 "작성자 일치" 조건은 어떤 행과도 매칭되지 않는다.
 * </p>
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    /** 로그인한 사용자 sq. 비로그인·익명이면 null. */
    public static Long sq() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return (principal instanceof Long) ? (Long) principal : null;
    }

    /**
     * 관리자 여부. 권한 부여는 {@code JwtAuthenticationToken} 한 곳에서만 일어난다
     * ({@code userTypeCd == 303L → ROLE_ADMIN}).
     */
    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
