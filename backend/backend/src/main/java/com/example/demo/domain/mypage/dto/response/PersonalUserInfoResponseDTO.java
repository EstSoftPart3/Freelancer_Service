package com.example.demo.domain.mypage.dto.response;

import java.math.BigDecimal;
import java.sql.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonalUserInfoResponseDTO {
    private String userId;
    private String userEmail;
    private String userNm;
    private Date userBirthDt;
    private String userGenderNm;
    private String userPhoneNum;
    private String userProfileImageUrl;
    private String zonecode;
    private String address;
    private String detailAddress;
    private Long sigunguCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
