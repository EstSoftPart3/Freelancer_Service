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

}
