package com.example.demo.domain.user.util;

import com.example.demo.domain.user.dto.UserDTO;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secretKeyPlain;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration; // 밀리초 단위 (예: 30분 = 1000 * 60 * 30)

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration; // 예: 14일 = 1000L * 60 * 60 * 24 * 14

    private Key secretKey;

    @PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyPlain.getBytes());
    }

    public String createAccessToken(UserDTO user) {
        return createToken(
                user.getUserSq(),
                user.getUserTypeCd(),
                accessTokenExpiration);
    }

    public String createRefreshToken(UserDTO user) {
        return createToken(
                user.getUserSq(),
                user.getUserTypeCd(),
                refreshTokenExpiration);
    }

    private String createToken(Long userSq, Long userTypeCd, long expirationTime) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(String.valueOf(userSq))
                .claim("userTypeCd", userTypeCd)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createResetToken(Long userSq) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 5 * 60 * 1000); // 5분 유효

        return Jwts.builder()
                .setSubject(String.valueOf(userSq))
                .claim("purpose", "reset-password")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long validateAndGetUserSq(String token, String requiredPurpose) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String purpose = claims.get("purpose", String.class);
            if (!requiredPurpose.equals(purpose)) {
                throw new JwtException("토큰 목적 불일치");
            }

            return Long.valueOf(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            throw new JwtException("유효하지 않은 토큰입니다.", e);
        }
    }

    public Long getUserSqFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    public Long getUserTypeCdFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("userTypeCd", Long.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
