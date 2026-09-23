package com.example.demo.domain.user.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.user.dto.AddressDTO;
import com.example.demo.domain.user.dto.CompanyProfileDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UsersDTO;
import com.example.demo.domain.user.dto.request.SignUpRequestDTO;
import com.example.demo.domain.user.dto.response.FindIdResponseDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public boolean isUserIdExists(String userId) {
        return userRepository.existsByUserId(userId);
    }

    @Transactional
    public void signUp(SignUpRequestDTO requestDto) {

        // 중복 검사
        if (userRepository.existsByUserId(requestDto.getUserId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByUserEmail(requestDto.getUserEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByUserPhoneNum(requestDto.getUserPhoneNum())) {
            throw new IllegalArgumentException("이미 사용 중인 휴대폰 번호입니다.");
        }

        // 2. 지역 코드 조회
        String sigungu = userRepository.findSigunguByAreaCode(requestDto.getSigunguCode());

        // 3. 주소 INSERT
        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setZonecode(requestDto.getZonecode());
        addressDTO.setAddress(requestDto.getAddress());
        addressDTO.setDetailAddress(requestDto.getDetailAddress());
        addressDTO.setSigungu(sigungu);
        addressDTO.setLatitude(requestDto.getLatitude());
        addressDTO.setLongitude(requestDto.getLongitude());
        addressDTO.setAreaCodeSq(requestDto.getSigunguCode());
        userRepository.insertAddress(addressDTO);

        // 4. 사용자 INSERT
        UserDTO userDTO = new UserDTO();
        userDTO.setAddressSq(addressDTO.getAddressSq());
        userDTO.setUserId(requestDto.getUserId());
        userDTO.setUserEmail(requestDto.getUserEmail());
        userDTO.setUserPw(passwordEncoder.encode(requestDto.getUserPw())); // 암호화된 비밀번호
        userDTO.setUserNm(requestDto.getUserNm());
        userDTO.setUserGenderCd(requestDto.getUserGenderCd());
        userDTO.setUserPhoneNum(requestDto.getUserPhoneNum());
        userDTO.setUserBirthDt(requestDto.getUserBirthDt());
        userDTO.setUserTypeCd(requestDto.getUserTypeCd());
        userDTO.setUserSignupTypeCd(requestDto.getUserSignupTypeCd());

        userRepository.insertUser(userDTO);

        // 5. 기업회원인 경우 기업정보 INSERT
        // 예: userTypeCd가 2이면 기업회원이라 가정
        if (requestDto.getUserTypeCd() != null && requestDto.getUserTypeCd() == 302L) {
            CompanyProfileDTO companyProfileDTO = new CompanyProfileDTO();
            companyProfileDTO.setUserSq(userDTO.getUserSq()); // user insert 후 자동 생성된 PK 필요
            companyProfileDTO.setAddressSq(addressDTO.getAddressSq());
            companyProfileDTO.setCompanyNm(requestDto.getCompanyNm());
            companyProfileDTO.setCompanyAuthStatusCd(2501L);
            userRepository.insertCompanyProfile(companyProfileDTO);
        }
    }

    public LoginResponseDTO getUserInfoByUserSq(Long userSq) {
        return userRepository.getUserInfoByUserSq(userSq);
    }

    public FindIdResponseDTO findUserIdByNameAndEmail(String name, String email) {
        Map<String, Object> userInfo = userRepository.findUserIdByNameAndEmail(name, email);

        if (userInfo == null || userInfo.isEmpty()) {
            return null;
        }

        Long userTypeCd = (userInfo.get("userTypeCd") instanceof Number)
                ? ((Number) userInfo.get("userTypeCd")).longValue()
                : null;
        String userTypeName = null;
        if (userTypeCd != null) {
            userTypeName = userRepository.findCommonCodeNameByCodeSq(userTypeCd);
        }

        FindIdResponseDTO dto = new FindIdResponseDTO();
        dto.setUserId((String) userInfo.get("userId"));
        dto.setUserNm((String) userInfo.get("userNm"));
        // 날짜 타입 안전하게 변환
        Object createdAtObj = userInfo.get("userCreatedAtDtm");
        if (createdAtObj instanceof java.sql.Timestamp) {
            dto.setUserCreatedAtDtm(((java.sql.Timestamp) createdAtObj).toLocalDateTime());
        } else if (createdAtObj instanceof LocalDateTime) {
            dto.setUserCreatedAtDtm((LocalDateTime) createdAtObj);
        }
        dto.setUserType(userTypeName);

        return dto;
    }

    public UserDTO findUserByInfo(String userId, String userNm, String userEmail) {
        return userRepository.findUserByInfo(userId, userNm, userEmail);
    }

    public String findCurrentPassword(Long userSq) {
        return userRepository.findPasswordByUserSq(userSq);
    }

    public boolean updatePassword(Long userSq, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        int updatedRows = userRepository.updatePassword(userSq, encodedPassword);
        return updatedRows > 0;
    }
    
    @Transactional
    public UserDTO getOrCreateSocialUser(String email, Map<String, Object> attributes) {
        UserDTO user = null;

        // 1. 이미 존재하는 이메일인지 확인
        boolean exists = userRepository.existsByUserEmail(email);

        if (exists) {
            // 2-A. 기존 유저가 존재하면 해당 유저 정보 조회
            // (findUserByInfo 매퍼를 활용하거나 이메일 기준 유저 정보를 받아옵니다)
            user = userRepository.findUserByInfo(null, null, email);
            
            if (user != null) {
                // 1) 탈퇴 여부 검증 ('Y'인 경우 로그인 차단)
                if ("Y".equalsIgnoreCase(user.getUserIsDeletedYn())) {
                    throw new IllegalArgumentException("탈퇴한 사용자입니다.");
                }

                // 2) 계정 활성화 여부 검증 (UsersDTO 조회)
                UsersDTO users = userRepository.findUserByUserId(user.getUserId());
                if (users != null && "N".equalsIgnoreCase(users.getUserIsActivateYn())) {
                    throw new IllegalArgumentException("비활성화된 사용자입니다.");
                }
            }
            
            
        } else {
            // 2-B. 신규 소셜 회원 가입 처리
            user = new UserDTO();
            String name = (String) attributes.getOrDefault("name", "구글사용자");
            
            // 구글 이메일 기반 아이디 생성 (예: google_test)
            String googleUserId = "google_" + email.split("@")[0];
            
            // 아이디 중복 방지 처리
            if (userRepository.existsByUserId(googleUserId)) {
                googleUserId = googleUserId + "_" + System.currentTimeMillis() % 1000;
            }

            user.setUserId(googleUserId);
            user.setUserEmail(email);
            user.setUserNm(name);
            user.setUserPw(passwordEncoder.encode("OAUTH2_SOCIAL_USER_DUMMY_PW")); // 소셜 로그인용 임시 암호화 비밀번호
            user.setUserTypeCd(301L); // 일반 사용자 유형 코드 (프로젝트 공통코드 기준)
            user.setUserSignupTypeCd(401L); // 구글 소셜 가입 구분 코드

            // 신규 사용자 저장 (useGeneratedKeys로 userSq 자동 채움)
            userRepository.insertUser(user);
       	}

        return user;
        }
}
