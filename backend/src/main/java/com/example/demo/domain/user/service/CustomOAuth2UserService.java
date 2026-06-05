package com.example.demo.domain.user.service;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.util.CustomOAuth2User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
	private final UserRepository userRepository;
	
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		OAuth2User oAuth2User = super.loadUser(userRequest);
		Map<String, Object> attributes = oAuth2User.getAttributes();
		
		String email = (String) attributes.get("email");
		String name = (String) attributes.get("name");
		
		UserDTO userDTO = userRepository.findByEmail(email);
		
		if (userDTO == null) {
			userDTO = new UserDTO();
			userDTO.setUserEmail(email);
			userDTO.setUserNm(name);
		}
		
		return new CustomOAuth2User(userDTO, attributes);
	}
}
