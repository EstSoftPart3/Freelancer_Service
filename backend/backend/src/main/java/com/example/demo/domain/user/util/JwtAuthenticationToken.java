package com.example.demo.domain.user.util;

import java.util.Collections;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.Getter;

@Getter
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final Long userSq;
    private final Long userTypeCd;

    public JwtAuthenticationToken(Long userSq, Long userTypeCd) {
        // userTypeCd가 303L이면 ROLE_ADMIN, 아니면 ROLE_USER 부여
        super(userTypeCd == 303L
                ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                : Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        this.userSq = userSq;
        this.userTypeCd = userTypeCd;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return this.userSq;
    }
}