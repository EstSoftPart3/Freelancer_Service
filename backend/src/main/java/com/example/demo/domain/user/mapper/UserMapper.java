package com.example.demo.domain.user.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.user.dto.AddressDTO;
import com.example.demo.domain.user.dto.CompanyProfileDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UsersDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;

@Mapper
public interface UserMapper {

    String selectSigunguByAreaCode(Long areaCodeSq);

    int insertAddress(AddressDTO addressDTO);

    int insertUser(UserDTO userDTO);

    boolean existsByUserId(String userId);

    boolean existsByUserEmail(String userEmail);

    boolean existsByUserPhoneNum(String userPhoneNum);

    boolean existsByUserNickname(String userNickname);

    boolean existsByUserNicknameExcludingUser(@Param("userNickname") String userNickname, @Param("userSq") Long userSq);

    int insertCompanyProfile(CompanyProfileDTO dto);

    UserDTO findByUserId(@Param("userId") String userId);
    
    UsersDTO findUserByUserId(@Param("userId") String userId);

    int updateRefreshToken(@Param("userSq") Long userSq, @Param("refreshToken") String refreshToken);

    UserDTO findByRefreshToken(String refreshToken);

    LoginResponseDTO findUserInfoByUserSq(@Param("userSq") Long userSq);

    void deleteRefreshTokenByUserSq(Long userSq);

    Map<String, Object> findUserInfoByNameAndEmail(@Param("name") String name, @Param("email") String email);

    String findCommonCodeNameByCodeSq(@Param("codeSq") Long codeSq);

    UserDTO findUserByInfo(@Param("userId") String userId, @Param("userNm") String userNm,
            @Param("userEmail") String userEmail);

    String findPasswordByUserSq(@Param("userSq") Long userSq);

    String selectEmailByUserSq(@Param("userSq") Long userSq);

    int updatePasswordByUserSq(@Param("userSq") Long userSq, @Param("newPassword") String newPassword);

    UserDTO findByEmail(@Param("email") String email);

}