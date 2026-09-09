package com.example.demo.domain.user.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class SignUpRequestDTO {
    // 사용자 정보
    private String userId;
    private String userEmail;
    private String userPw;
    private String userNm;
    private Long userGenderCd;
    private String userPhoneNum;
    private LocalDate userBirthDt;
    private Long userTypeCd;
    private Long userSignupTypeCd;
    private String userProfileImageUrl;

    // 주소 정보
    private String zonecode;
    private String address;
    private String detailAddress;
    private Long sigunguCode;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // 기업 정보 (기업 회원인 경우만 사용)
    private String companyNm;
    private String companyCeoNm;
    private LocalDate companyOpenDt;
    private String companyBizNum;
}
