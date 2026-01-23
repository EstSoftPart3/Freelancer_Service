package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer; // 정정된 임포트
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@Profile("prod")
@RequiredArgsConstructor
public class SecurityConfigProd {

    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.disable()) // 필요 시 설정 추가
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 1. 정적 리소스 및 기본 경로 허용
                        .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**", "/img/**", "/favicon.ico", "/error").permitAll()
                        
                        // 2. 로그인 및 토큰 관련 허용
                        .requestMatchers("/login", "/refresh-token").permitAll()
                        
                        // 3. [추가] 구글 소셜 로그인 콜백 경로 허용 (401 에러 해결 핵심)
                        .requestMatchers("/login/oauth2/code/**").permitAll()
                        .requestMatchers("/api/auth/social/**").permitAll()
                        
                        // 4. [추가] 공개 API 경로 허용 (프로젝트 목록, 지도 등)
                        .requestMatchers("/projects/**").permitAll() // /api/projects, /api/projects/top 모두 포함
                        .requestMatchers("/map/**").permitAll()
                        .requestMatchers("/board/**", "/qna/**", "/affiliation/**").permitAll()
                        .requestMatchers("/email/**", "/signup", "/check-id", "/find-id", "/reset-password/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized - 로그인 필요");
                        }))
                // ★ 중요: 필터를 @Bean으로 따로 등록하지 않고 여기서 직접 생성해서 넣어야 전역 필터로 작동하는 것을 방지합니다.
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers(
                "/", "/index.html", "/error", "/favicon.ico",
                "/css/**", "/js/**", "/img/**", "/vendor/**", "/static/**", "/assets/**" // 폴더 단위로 깔끔하게 수정
            );
    }
}