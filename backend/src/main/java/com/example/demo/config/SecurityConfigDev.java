package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;

import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;

/**
 * 개발(dev) 프로파일 전용 Security 설정.
 *
 * <p>경계 정책: 아래 {@code anyRequest().permitAll()}은 개발 편의를 위한 인증 완화이며,
 * 운영(prod)에 그대로 옮기면 안 된다. 운영 경계는 {@link SecurityConfigProd} 참고.
 *
 * <p>경로 매칭 주의: {@code server.servlet.context-path=/api}가 적용되어 클라이언트 실제 URL은
 * 모두 {@code /api/...}이지만, Spring Security {@code requestMatchers}는 context-path를 벗긴
 * 경로로 매칭한다. 즉 아래 {@code "/admin/**"}, {@code "/me"}는 실제 {@code /api/admin/**},
 * {@code /api/me}에 해당한다(prod 설정이 여기서 어긋나 있으니 배포 전 반드시 정합화할 것).
 */
@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class SecurityConfigDev {

    private final JwtProvider jwtProvider;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:8504"); // Vue(FO)
        configuration.addAllowedOrigin("http://localhost:3000"); // Next.js(FO 마이그레이션)
        configuration.addAllowedOrigin("http://localhost:5173"); // React(BO)
        configuration.addAllowedOrigin("https://job.estsw.co.kr");
        configuration.addAllowedOrigin("https://admin-job.estsw.co.kr");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true); // 쿠키 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // 최신 방식의 disable 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // --- 추가: 헬스 체크 경로는 인증 없이 접근 허용 ---
                        .requestMatchers("/actuator/**").permitAll()
                        // 1. 관리자 로그인 및 토큰 재발급은 누구나 접근 가능
                        .requestMatchers("/admin/login", "/admin/refresh-token").permitAll()
                        // 2. /api/admin으로 시작하는 모든 경로는 'ADMIN' 권한 필요
                        .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                        // 3. 사용자 정보 조회 등은 인증 필요
                        .requestMatchers("/me").authenticated()
                        // 4. 나머지는 FO와 동일하게 유지 (상황에 따라 조정)
                        .anyRequest().permitAll())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout.disable());

        return http.build();
    }

    @Bean
    public Filter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }
}
