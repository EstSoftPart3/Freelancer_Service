package com.example.demo.domain.user.repository;

import java.util.Map;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.user.dto.AddressDTO;
import com.example.demo.domain.user.dto.CompanyProfileDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UsersDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final UserMapper userMapper;

    public boolean existsByUserId(String userId) {
        return userMapper.existsByUserId(userId);
    }

    public boolean existsByUserEmail(String userEmail) {
        return userMapper.existsByUserEmail(userEmail);
    }

    public boolean existsByUserPhoneNum(String userPhoneNum) {
        return userMapper.existsByUserPhoneNum(userPhoneNum);
    }

    public boolean existsByUserNickname(String userNickname) {
        return userMapper.existsByUserNickname(userNickname);
    }

    public boolean existsByUserNicknameExcludingUser(String userNickname, Long userSq) {
        return userMapper.existsByUserNicknameExcludingUser(userNickname, userSq);
    }

    public String findSigunguByAreaCode(Long areaCodeSq) {
        return userMapper.selectSigunguByAreaCode(areaCodeSq);
    }

    public int insertAddress(AddressDTO dto) {
        return userMapper.insertAddress(dto); // addressSq 자동 세팅
    }

    public int insertUser(UserDTO dto) {
        return userMapper.insertUser(dto);
    }

    public int insertCompanyProfile(CompanyProfileDTO dto) {
        return userMapper.insertCompanyProfile(dto);
    }

    public UserDTO findByUserId(String userId) {
        return userMapper.findByUserId(userId);
    }
    
    public UsersDTO findUserByUserId(String userId) {
    	return userMapper.findUserByUserId(userId);
    }

    public void updateRefreshToken(Long userSq, String refreshToken) {
        userMapper.updateRefreshToken(userSq, refreshToken);
    }

    public UserDTO findByRefreshToken(String refreshToken) {
        return userMapper.findByRefreshToken(refreshToken);
    }

    public LoginResponseDTO getUserInfoByUserSq(Long userSq) {
        return userMapper.findUserInfoByUserSq(userSq);
    }

    public void deleteRefreshTokenByUserSq(Long userSq) {
        userMapper.deleteRefreshTokenByUserSq(userSq);
    }

    public Map<String, Object> findUserIdByNameAndEmail(String name, String email) {
        return userMapper.findUserInfoByNameAndEmail(name, email);
    }

    public String findCommonCodeNameByCodeSq(Long commonCodeSq) {
        return userMapper.findCommonCodeNameByCodeSq(commonCodeSq);
    }

    public UserDTO findUserByInfo(String userId, String userNm, String userEmail) {
        return userMapper.findUserByInfo(userId, userNm, userEmail);
    }

    public String findPasswordByUserSq(Long userSq) {
        return userMapper.findPasswordByUserSq(userSq);
    }

    public int updatePassword(Long userSq, String newPassword) {
        return userMapper.updatePasswordByUserSq(userSq, newPassword);
    }

    public UserDTO findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

}