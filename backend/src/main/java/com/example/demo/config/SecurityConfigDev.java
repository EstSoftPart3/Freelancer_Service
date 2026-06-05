package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.domain.user.service.CustomOAuth2UserService;
import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;
import com.example.demo.domain.user.util.OAuth2SuccessHandler;
import com.nimbusds.openid.connect.sdk.claims.UserInfo;


import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class SecurityConfigDev {

    private final JwtProvider jwtProvider;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:8504"); // Vue(FO)
        configuration.addAllowedOrigin("http://localhost:5173"); // React(BO)
        configuration.addAllowedOrigin("https://job.estsw.co.kr");
        configuration.addAllowedOrigin("https://admin-job.estsw.co.kr");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true); // 쿠키 허용
        configuration.addAllowedOriginPattern("https://*.vercel.app");
        configuration.addAllowedOriginPattern("https://*.netlify.app");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // 최신 방식의 disable 설정
                .oauth2Login(oauth2 -> oauth2
                		.userInfoEndpoint(userInfo -> userInfo
                				.userService(customOAuth2UserService))
                		.successHandler(oAuth2SuccessHandler))
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
