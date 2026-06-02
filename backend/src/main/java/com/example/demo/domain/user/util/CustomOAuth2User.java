package com.example.demo.domain.user.util;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.example.demo.domain.user.dto.UserDTO;

public class CustomOAuth2User implements OAuth2User{
	private final UserDTO userDTO;
	private final Map<String, Object> attributes;
	
	public CustomOAuth2User(UserDTO userDTO, Map<String, Object> attributes) {
		this.userDTO = userDTO;
		this.attributes = attributes;
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return null;
	}
	
	@Override
	public String getName() {
		return userDTO.getUserNm();
	}
	
	@Override
	public Map<String, Object> getAttributes() {
		return attributes;
	}
	
	public UserDTO getUserDTO() {
		return userDTO;
	}

}
