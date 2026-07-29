package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * 운영(prod) 프로파일 전용 Security 설정. (#290)
 *
 * <p><b>경계 정책</b> — dev({@link SecurityConfigDev})는 개발 편의상 {@code anyRequest().permitAll()}이지만
 * 운영은 기본 차단({@code anyRequest().authenticated()}) 위에 필요한 경로만 연다:
 *
 * <ul>
 *   <li><b>비로그인 계정 플로우</b> — 로그인·토큰재발급·회원가입·이메일 인증·아이디/비밀번호 찾기</li>
 *   <li><b>SEO public GET</b> — 프로젝트·게시판·QnA·공지·커뮤니티·소속 조회. Next.js FO의
 *       SSR/generateMetadata/sitemap/RSS가 비로그인으로 호출하므로 막히면 검색엔진 노출이 무력화된다.</li>
 *   <li><b>익명 조회수</b> — FO가 로그인 여부와 무관하게 각 리소스의 {@code increment-view} PATCH를 호출한다
 *       (frontend/nextjs/lib/viewCount.ts).</li>
 *   <li><b>관리자(BO)</b> — {@code /admin/login}·{@code /admin/refresh-token}만 공개,
 *       나머지 {@code /admin/**}는 ROLE_ADMIN.</li>
 * </ul>
 *
 * <p><b>경로 매칭 주의</b>: {@code server.servlet.context-path=/api}가 적용되어 클라이언트 실제 URL은
 * {@code /api/...}이지만 {@code requestMatchers}는 context-path를 벗긴 경로로 매칭한다.
 * 또한 matcher는 선언 순서대로 first-match-wins이므로, 인증이 필요한
 * {@code /projects/applications/**}·{@code /projects/companies*}를 공개 {@code GET /projects/**}보다
 * 먼저 선언해야 한다.
 */
@Configuration
@Profile("prod") // 운영 환경일 때만 활성화
@RequiredArgsConstructor
public class SecurityConfigProd {

    private final JwtProvider jwtProvider;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("https://job.estsw.co.kr"); // FO(Next.js)
        configuration.addAllowedOrigin("https://admin-job.estsw.co.kr"); // BO(React)
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true); // refresh 쿠키 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ---- preflight·인프라 ----
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll() // 게시글 이미지 등 정적 리소스

                        // ---- 비로그인 계정 플로우 ----
                        .requestMatchers(HttpMethod.POST, "/login", "/refresh-token", "/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/check-id", "/check-nickname").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/email/send-code", "/email/find/send-code", "/email/verify-code").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/find-id", "/reset-password/verify", "/reset-password").permitAll()

                        // ---- 관리자(BO) ----
                        .requestMatchers("/admin/login", "/admin/refresh-token").permitAll()
                        .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")

                        // ---- 프로젝트: 인증 필요 경로를 공개 GET보다 먼저 선언 ----
                        .requestMatchers("/projects/applications/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/projects/companies", "/projects/companies/status").authenticated()
                        .requestMatchers(HttpMethod.GET, "/projects/**").permitAll()

                        // ---- SEO public GET: 커뮤니티·공지·소속 ----
                        .requestMatchers(HttpMethod.GET,
                                "/board/**", "/qna/**", "/notice/**", "/community/**", "/answer/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/affiliation", "/affiliation/address").permitAll()

                        // ---- 익명 조회수 (FO가 비로그인에도 호출) ----
                        .requestMatchers(HttpMethod.PATCH,
                                "/projects/*/increment-view",
                                "/board/*/increment-view",
                                "/qna/*/increment-view",
                                "/answer/*/increment-view",
                                "/notice/*/increment-view",
                                "/affiliation/*/increment-view").permitAll()

                        // ---- 그 외 전부 인증 필요 ----
                        .requestMatchers("/me").authenticated()
                        .anyRequest().authenticated())
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
