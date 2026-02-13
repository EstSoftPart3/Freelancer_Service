package com.example.demo.domain.user.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UserSocialDTO;

@Mapper
public interface UserSocialMapper {
	
	//소셜 계정 존재 여부 확인
	UserDTO findUserBySocialIdAndProvider (
			@Param("socialId") String socialId,
			@Param("providerCd") String providerCd
	);
	
	//user 테이블 Insert
	void insertUser(UserDTO userDTO);
	
	//user_social_account 테이블 Insert
	void insertUserSocialAccount(UserSocialDTO userSocialDTO);
}
