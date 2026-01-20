package com.example.demo.domain.user.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.user.dto.AddressDTO;
import com.example.demo.domain.user.dto.CompanyProfileDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;

@Mapper
public interface UserMapper {

    String selectSigunguByAreaCode(Long areaCodeSq);

    int insertAddress(AddressDTO addressDTO);

    int insertUser(UserDTO userDTO);

    boolean existsByUserId(String userId);
    
    boolean existsByUserSq(@Param("userSq") Long userSq);

    boolean existsByUserEmail(String userEmail);

    boolean existsByUserPhoneNum(String userPhoneNum);

    int insertCompanyProfile(CompanyProfileDTO dto);

    UserDTO findByUserId(@Param("userId") String userId);

    int updateRefreshToken(@Param("userSq") Long userSq, @Param("refreshToken") String refreshToken);

    UserDTO findByRefreshToken(String refreshToken);

    LoginResponseDTO findUserInfoByUserSq(@Param("userSq") Long userSq);

    void deleteRefreshTokenByUserSq(Long userSq);

    Map<String, Object> findUserInfoByNameAndEmail(@Param("name") String name, @Param("email") String email);

    String findCommonCodeNameByCodeSq(@Param("codeSq") Long codeSq);

    UserDTO findUserByInfo(@Param("userId") String userId, @Param("userNm") String userNm,
            @Param("userEmail") String userEmail);

    String findPasswordByUserSq(@Param("userSq") Long userSq);

    int updatePasswordByUserSq(@Param("userSq") Long userSq, @Param("newPassword") String newPassword);

    UserDTO findByEmail(@Param("email") String email);
    
    // 1. 소셜 ID로 사용자 조회 (로그인/판별용)
    UserDTO findBySocialId(@Param("socialId") String socialId);

    // 2. 계정 통합을 위한 소셜 ID 업데이트 (통합용)
    int updateSocialId(@Param("userId") String userId, @Param("socialId") String socialId);
    
    // 소셜 연동 해제 (social_id를 NULL로 업데이트)
    int updateSocialIdToNull(Long userSq);
    
    // 소셜 통합 모달 전용 이메일 일치 확인 메소드
    UserDTO findUserForSocialIntegration(String email);

    // 사용자 주소 순번 획득
    Long findAddressSqByUserSq(@Param("userSq") Long userSq); 


}