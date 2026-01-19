package com.example.demo.domain.user.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SocialSignUpRequestDTO {
    
    // 사용자 정보
    private String userId;        // Shadow ID(S_googleId)가 할당될 필드
    private String userEmail;
    private String userNm;
    private Long userGenderCd;
    private String userPhoneNum;
    private LocalDate userBirthDt;
    private Long userTypeCd;      // 301: 개인
    private Long userSignupTypeCd;// 203: Google
    private String socialId;
    private String userAgreedPrivacyPolicyYn; // 약관 동의 여부 (Y/N)

    // 주소 정보 (프론트의 address_sq는 DTO의 zonecode와 매핑됨)
    private String addressSq;     // 프론트의 postcode 값
    private String address;
    private String detailAddress;
    private Long sigunguCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
}