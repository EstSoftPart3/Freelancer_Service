package com.example.demo.domain.user.repository;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UserSocialDTO;
import com.example.demo.domain.user.mapper.UserMapper;
import com.example.demo.domain.user.mapper.UserSocialMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserSocialRepository {
	
	private final UserSocialMapper userSocialMapper;
	
	public UserDTO findUserBySocialIdAndProvider(String userId, String providerCd) {
		return userSocialMapper.findUserBySocialIdAndProvider(userId, providerCd);
	}
	
	public void insertUser(UserDTO userDTO) {
		userSocialMapper.insertUser(userDTO);
	}
	
	public void insertUserSocialAccount(UserSocialDTO userSocialDTO) {
		userSocialMapper.insertUserSocialAccount(userSocialDTO);
	}
}
