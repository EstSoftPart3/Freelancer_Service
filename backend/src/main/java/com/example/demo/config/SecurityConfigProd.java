package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * 운영(prod) 프로파일 전용 Security 설정.
 *
 * <p><b>현재 미배포 상태</b>(application.yml {@code active: dev}). 아래 설정은
 * {@link SecurityConfigDev}와 정합하지 않으므로, prod로 실제 배포하기 전 다음 항목을
 * 반드시 정리해야 한다(정리 전 배포 시 로그인·관리자·CORS가 모두 깨진다):
 *
 * <ol>
 *   <li><b>로그인 경로 오기입</b> — {@code server.servlet.context-path=/api} 때문에
 *       {@code requestMatchers}는 context-path를 벗긴 경로로 매칭한다. 아래
 *       {@code "/api/login"}, {@code "/api/refresh-token"}은 실제 매칭 경로
 *       {@code "/login"}, {@code "/refresh-token"}과 어긋나 permitAll이 적용되지 않고
 *       {@code anyRequest().authenticated()}에 걸린다 → prod 로그인 전면 401.
 *       dev처럼 {@code /api} 접두어를 빼야 한다.</li>
 *   <li><b>CORS 소스 빈 부재</b> — {@code .cors()}만 호출하고
 *       {@code CorsConfigurationSource} 빈이 없어 실제 CORS가 동작하지 않는다.
 *       dev의 {@code corsConfigurationSource()}에 해당하는 운영 도메인 허용 빈이 필요하다.</li>
 *   <li><b>관리자 가드 부재</b> — dev의 {@code "/admin/**" → hasAuthority("ROLE_ADMIN")}와
 *       {@code "/admin/login"} permitAll이 없다. 현재는 {@code anyRequest().authenticated()}로만
 *       걸려 관리자 로그인도 401이고 권한 경계도 흐려진다.</li>
 *   <li><b>FO public GET 정책</b> — FO 마이그레이션은 {@code /projects}·{@code /board}·
 *       {@code /notice} 목록 등을 비로그인 SEO public으로 설계했다. {@code anyRequest().authenticated()}는
 *       이 조회들을 401로 막으므로, public 조회 경로를 permitAll로 분류해야 한다.
 *       (커뮤니티 고도화로 추가된 {@code /community/boards}, {@code /community/best}도
 *       동일하게 비로그인 public GET이어야 한다.)</li>
 *   <li>actuator 헬스체크·OPTIONS preflight permitAll도 dev 기준으로 추가 필요.</li>
 * </ol>
 *
 * <p>본 이슈(#290)에서는 배포 계획이 없어 인증 로직은 변경하지 않고 위 경계 의도만 문서화한다.
 */
@Configuration
@Profile("prod") // 운영 환경일 때만 활성화
@RequiredArgsConstructor
public class SecurityConfigProd {

    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // FIXME(#290): CorsConfigurationSource 빈이 없어 CORS 미동작 — 배포 전 운영 도메인 허용 빈 추가
                .cors()
                .and()
                .csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(authorize -> authorize
                        // FIXME(#290): context-path(/api) 때문에 매칭 경로는 "/login"·"/refresh-token"이어야 함. 현재 "/api" 접두어 오기입으로 prod 로그인 401
                        .requestMatchers("/api/login", "/api/refresh-token").permitAll()
                        // FIXME(#290): "/admin/**" ROLE_ADMIN 가드·"/admin/login" permitAll 부재, FO public GET(projects/board/notice) 미분류 — 클래스 주석 참고
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
