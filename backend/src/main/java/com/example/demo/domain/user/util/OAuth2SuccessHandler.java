package com.example.demo.domain.user.util;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.repository.UserRepository;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
	
	private final JwtProvider jwtProvider;
	private final UserRepository userRepository;
	
	@Value("${app.frontend-url}")
	private String frontendUrl;
	
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
			Authentication authentication) throws IOException {
		CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();
		UserDTO user = customUserDetails.getUserDTO();
		
		
		
		if (user.getUserSq() == null) {
			String encodedName = java.net.URLEncoder.encode(user.getUserNm(), "UTF-8");
			String redirectUrl = frontendUrl + "/oauth2/redirect?needSignup=true&email=" + user.getUserEmail() + "&name=" + encodedName;
			
			getRedirectStrategy().sendRedirect(request, response, redirectUrl);
			return;
		}
		
		String accessToken = jwtProvider.createAccessToken(user);
		String refreshToken = jwtProvider.createRefreshToken(user);
		
		userRepository.updateRefreshToken(user.getUserSq(), refreshToken);
		
		Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
		refreshCookie.setHttpOnly(true);
		refreshCookie.setSecure(true);
		refreshCookie.setPath("/");
		refreshCookie.setMaxAge(14 * 24 * 60 * 60);
		response.addCookie(refreshCookie);
		
		String redirectUrl = frontendUrl + "/oauth2/redirect?token=" + accessToken;
		getRedirectStrategy().sendRedirect(request, response, redirectUrl);
				
		}

}
