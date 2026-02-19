package com.example.demo.domain.user.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.user.dto.AddressDTO;
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

	// 주소 INSERT
	void insertAddress(AddressDTO addressDTO);

	// 지역코드 조회
	String selectSigunguByAreaCode(@Param("areaCodeSq") Long areaCodeSq);
}
