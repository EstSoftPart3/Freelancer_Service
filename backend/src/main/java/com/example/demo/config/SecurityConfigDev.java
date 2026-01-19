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

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class SecurityConfigDev {

    private final JwtProvider jwtProvider;

    // 개발용
    // @Bean
    // public CorsConfigurationSource corsConfigurationSource() {
    // CorsConfiguration configuration = new CorsConfiguration();
    // configuration.addAllowedOrigin("http://localhost:8504");
    // configuration.addAllowedOrigin("http://localhost:3000");
    // configuration.addAllowedOrigin("https://31f05472343a.ngrok-free.app");
    // configuration.addAllowedOrigin("https://test-paulbaeks-projects.vercel.app");
    // configuration.addAllowedMethod("*");
    // configuration.addAllowedHeader("*");
    // configuration.setAllowCredentials(true); // 쿠키 허용

    // UrlBasedCorsConfigurationSource source = new
    // UrlBasedCorsConfigurationSource();
    // source.registerCorsConfiguration("/**", configuration);
    // return source;
    // }

    // 외부 배포 테스트용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:8504",
                "http://localhost:3000",
                "https://e4f5e44bf928.ngrok-free.app",
                "https://test-eight-tau-87.vercel.app/"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 1. 구글 관련 엔드포인트 허용 (중요!)
                        .requestMatchers("/api/login/oauth2/code/**").permitAll() 
                        .requestMatchers("/login", "/refresh-token").permitAll()
                        .requestMatchers("/api/auth/social/**").permitAll()
                        .requestMatchers("/me", "/logout").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .anyRequest().permitAll()
                )
//                // 2. OAuth2 로그인 기능 활성화 및 경로 설정
//                .oauth2Login(oauth2 -> oauth2
//                        .authorizationEndpoint(authorization -> authorization
//                                // Vue에서 호출하는 /api/oauth2/authorization 주소를 처리하기 위한 설정
//                                .baseUri("/oauth2/authorization") 
//                        )
//                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout().disable();

        return http.build();
    }

    @Bean
    public Filter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }
}
