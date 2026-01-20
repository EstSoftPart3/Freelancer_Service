package com.example.demo.domain.user.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.user.dto.AddressDTO;
import com.example.demo.domain.user.dto.CompanyProfileDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.request.SignUpRequestDTO;
import com.example.demo.domain.user.dto.response.FindIdResponseDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.mapper.UserMapper;
import com.example.demo.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public boolean isUserIdExists(String userId) {
        return userRepository.existsByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
 // --- 추가된 메서드: 소셜 ID로 사용자 조회 ---
    @Transactional(readOnly = true)
    public UserDTO findBySocialId(String socialId) {
        return userRepository.findBySocialId(socialId);
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

     // 4. 사용자 INSERT (소셜 대응 리팩토링)
        UserDTO userDTO = new UserDTO();
        userDTO.setAddressSq(addressDTO.getAddressSq());
        userDTO.setUserId(requestDto.getUserId());
        userDTO.setUserEmail(requestDto.getUserEmail());
        userDTO.setUserNm(requestDto.getUserNm());
        userDTO.setUserGenderCd(requestDto.getUserGenderCd());
        userDTO.setUserPhoneNum(requestDto.getUserPhoneNum());
        userDTO.setUserBirthDt(requestDto.getUserBirthDt());
        userDTO.setUserTypeCd(requestDto.getUserTypeCd());
        userDTO.setUserSignupTypeCd(requestDto.getUserSignupTypeCd());

        // 소셜 ID가 있다면 세팅, 비밀번호는 소셜 가입 시 암호화하지 않음 (null 허용)
        if (requestDto.getSocialId() != null && !requestDto.getSocialId().isEmpty()) {
            userDTO.setSocialId(requestDto.getSocialId());
            userDTO.setUserPw(null); // 소셜 가입은 비밀번호가 없음
        } else {
            // 일반 가입일 때만 비밀번호 암호화
            userDTO.setUserPw(passwordEncoder.encode(requestDto.getUserPw()));
        }

        userRepository.insertUser(userDTO);

        // 5. 기업회원인 경우 기업정보 INSERT
        // 예: userTypeCd가 2이면 기업회원이라 가정
        if (requestDto.getUserTypeCd() != null && requestDto.getUserTypeCd() == 302L) {
            CompanyProfileDTO companyProfileDTO = new CompanyProfileDTO();
            companyProfileDTO.setUserSq(userDTO.getUserSq()); // user insert 후 자동 생성된 PK 필요
            companyProfileDTO.setAddressSq(addressDTO.getAddressSq());
            companyProfileDTO.setCompanyNm(requestDto.getCompanyNm());
            companyProfileDTO.setCompanyCeoNm(requestDto.getCompanyCeoNm());
            companyProfileDTO.setCompanyOpenDt(requestDto.getCompanyOpenDt());
            companyProfileDTO.setCompanyBizNum(requestDto.getCompanyBizNum());

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
        dto.setUserCreatedAtDtm((LocalDateTime) userInfo.get("userCreatedAtDtm"));
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
    public int linkSocialAccount(String userId, String socialId) {
        // 1. 기존 유저가 있는지 체크 (선택사항이지만 보안상 권장)
        if (!userRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }
        
        // 2. 리포지토리를 통해 DB의 social_id 컬럼만 업데이트
        return userRepository.updateSocialId(userId, socialId);
    }
    
    public UserDTO findUserForSocialIntegration(String email) {
        return userMapper.findUserForSocialIntegration(email);
    }
}
