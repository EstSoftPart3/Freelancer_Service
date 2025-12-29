package com.example.demo.domain.user.util;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Getter
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final Long userSq;
    private final Long userTypeCd;

    public JwtAuthenticationToken(Long userSq, Long userTypeCd) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
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
