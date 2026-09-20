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
				"https://job.estsw.co.kr", "https://admin-job.estsw.co.kr", "https://vue-js-sigma-two.vercel.app"));

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
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
					// PreFlight CORS 요청 및 OPTIONS 허용
					.requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
					.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
		
					// 1. 로그인/인증/헬스체크 관련 경로 최상단에서 전면 허용
					.requestMatchers("/login/**", "/api/login", "/v1/auth/**", "/api/v1/auth/**").permitAll()
					.requestMatchers("/login/oauth2/**", "/oauth2/**", "/v1/auth/google/login").permitAll()
					.requestMatchers("/actuator/**", "/admin/login", "/admin/refresh-token").permitAll()
		
					// 2. 권한 제한이 필요한 경로
					.requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
					.requestMatchers("/me").authenticated()
		
					// 3. 기타 요청
					.anyRequest().permitAll()
				)
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