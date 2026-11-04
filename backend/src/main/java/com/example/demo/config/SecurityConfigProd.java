package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@Profile("prod") // 운영 환경일 때만 활성화
@RequiredArgsConstructor
public class SecurityConfigProd {

    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // requestMatchers 는 context-path(/api)를 뺀 경로로 비교한다.
                // 공개 경로는 JwtAuthenticationFilter.EXCLUDE_URLS 에도 있어야 실제로 열린다.
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()

                        // 비로그인 계정 흐름
                        .requestMatchers(HttpMethod.POST, "/login", "/refresh-token", "/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/check-id").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/email/send-code", "/email/find/send-code", "/email/verify-code",
                                "/find-id", "/reset-password", "/reset-password/verify").permitAll()
                        .requestMatchers("/company/verify").permitAll()

                        // 관리자
                        .requestMatchers("/admin/login", "/admin/refresh-token").permitAll()
                        .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")

                        // 인증이 필요한 프로젝트 경로를 공개 GET 보다 먼저 둔다
                        .requestMatchers(HttpMethod.GET, "/projects/applications/interviews/*").permitAll()
                        .requestMatchers("/projects/applications/**").authenticated()

                        // 공개 조회
                        .requestMatchers(HttpMethod.GET,
                                "/projects/**", "/board/**", "/qna/**", "/answer/**", "/notice/**",
                                "/affiliation/**", "/file/**", "/files/**", "/uploads/**", "/download/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH,
                                "/board/*/increment-view", "/qna/*/increment-view", "/answer/*/increment-view",
                                "/notice/*/increment-view", "/affiliation/*/increment-view").permitAll()

                        .anyRequest().authenticated())
                // 기본 LogoutFilter 가 LoginController.logout() 을 가로채지 않게 끈다
                .logout(logout -> logout.disable())
                // 인증 실패(로그인 안된 상태) 시 처리
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            // 로그 남기기
                            System.out.println("Authentication failed: " + authException.getMessage());
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized - 로그인 필요");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            // 권한 부족시 처리
                            System.out.println("Access denied: " + accessDeniedException.getMessage());
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden - 권한 부족");
                        }))
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public Filter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }
}
