package com.example.demo.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.request.SignUpRequestDTO;
import com.example.demo.domain.user.dto.request.SocialSignUpRequestDTO;
import com.example.demo.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth/social")
@RequiredArgsConstructor
public class SocialSignUpController {

    private final UserService userService;

    // 소셜 신규 회원가입 처리 (URI: /api/auth/social/join)
    @PostMapping("/join")
    public ApiResponse<?> joinSocialUser(@RequestBody SocialSignUpRequestDTO socialDto) {
        log.info(">>>> [소셜 신규 가입 시작] socialId: {} <<<<", socialDto.getSocialId());

        try {
            // 1. Shadow ID 전략: user_id NOT NULL 제약조건 해결을 위한 식별자 생성
            String googleId = socialDto.getSocialId();
            String shadowId = "S_" + googleId;
            if (shadowId.length() > 30) shadowId = shadowId.substring(0, 30);

            // 2. 기존 가입 로직(signUp)과 호환을 위한 DTO 변환
            SignUpRequestDTO normalDto = new SignUpRequestDTO();
            normalDto.setUserId(shadowId);
            normalDto.setUserEmail(socialDto.getUserEmail());
            normalDto.setUserNm(socialDto.getUserNm());
            normalDto.setUserPhoneNum(socialDto.getUserPhoneNum());
            normalDto.setUserGenderCd(socialDto.getUserGenderCd());
            normalDto.setUserBirthDt(socialDto.getUserBirthDt());
            normalDto.setSocialId(googleId);
            normalDto.setUserSignupTypeCd(203L);
            normalDto.setUserTypeCd(301L);

            // 주소 정보 매핑 (address_sq -> zonecode)
            normalDto.setZonecode(socialDto.getAddressSq());
            normalDto.setAddress(socialDto.getAddress());
            normalDto.setDetailAddress(socialDto.getDetailAddress());
            normalDto.setSigunguCode(socialDto.getSigunguCode());
            normalDto.setLatitude(socialDto.getLatitude());
            normalDto.setLongitude(socialDto.getLongitude());

            // 3. 기존 서비스의 회원가입 로직 호출
            userService.signUp(normalDto);

            return ApiResponse.of(HttpStatus.OK, "success", "소셜 회원가입이 완료되었습니다.");

        } catch (IllegalArgumentException e) {
            return ApiResponse.of(HttpStatus.BAD_REQUEST, "fail", e.getMessage());
        } catch (Exception e) {
            log.error("소셜 가입 중 오류 발생: ", e);
            return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "error", "서버 오류가 발생했습니다.");
        }
    }
}