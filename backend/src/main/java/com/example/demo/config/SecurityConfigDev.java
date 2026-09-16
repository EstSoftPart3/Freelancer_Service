package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;

import com.example.demo.domain.auth.util.OAuth2SuccessHandler;
import com.example.demo.domain.user.util.JwtAuthenticationFilter;
import com.example.demo.domain.user.util.JwtProvider;

import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class SecurityConfigDev {

	private final JwtProvider jwtProvider;
	private final OAuth2SuccessHandler oAuth2SuccessHandler;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(List.of("http://localhost:8504", "http://localhost:5173",
				"https://job.estsw.co.kr", "https://admin-job.estsw.co.kr"));

		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> csrf.disable()) 
				.authorizeHttpRequests(auth -> auth.requestMatchers(reqeust -> CorsUtils.isPreFlightRequest(reqeust))
						.permitAll().requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/v1/auth/google/login").permitAll()
						// --- 추가: 헬스 체크 경로는 인증 없이 접근 허용 ---
						.requestMatchers("/actuator/**").permitAll()
						// 1. 관리자 로그인 및 토큰 재발급은 누구나 접근 가능
						.requestMatchers("/admin/login", "/admin/refresh-token").permitAll()
						// 2. /api/admin으로 시작하는 모든 경로는 'ADMIN' 권한 필요
						.requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
						// 3. 사용자 정보 조회 등은 인증 필요
						.requestMatchers("/me").authenticated()
						// 4. 나머지는 FO와 동일하게 유지 (상황에 따라 조정)

						// OAuth2 관련 로그인/인증 엔드포인트 접근 허용
						.requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
						.requestMatchers("/api/v1/auth/**", "/v1/auth/**").permitAll().anyRequest().permitAll())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.oauth2Login(oauth -> oauth.successHandler(oAuth2SuccessHandler))

				.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
				.logout(logout -> logout.disable());

		return http.build();
	}

	@Bean
	public Filter jwtAuthenticationFilter() {
		return new JwtAuthenticationFilter(jwtProvider);
	}
}