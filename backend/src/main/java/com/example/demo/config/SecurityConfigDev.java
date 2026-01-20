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
                // .cors().and() // 개발용
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 외부 배포 테스트용
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/login","/refresh-token").permitAll()
                        .requestMatchers("/api/map/static").permitAll()
                        .requestMatchers("/me","/logout").authenticated() // ✅ 사용자 정보는 인증 필요
                        .requestMatchers("/api/notifications/**").authenticated()                        
                        .anyRequest().permitAll() // 그 외는 자유 접근 (필요시 조정)
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout().disable(); // JWT 기반이므로 로그아웃 무효화

        return http.build();
    }

    @Bean
    public Filter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }
}
