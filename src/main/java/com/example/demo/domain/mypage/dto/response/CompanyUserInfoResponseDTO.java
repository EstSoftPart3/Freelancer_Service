package com.example.demo.domain.mypage.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyUserInfoResponseDTO {
    private String userId;
    private String userEmail;
    private String userNm;
    private String userPhoneNum;
    private String zonecode;
    private String address;
    private String detailAddress;
    private String userProfileImageUrl;
    private Long sigunguCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String companyNm;
}
