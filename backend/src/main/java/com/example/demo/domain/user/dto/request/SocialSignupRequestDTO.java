package com.example.demo.domain.user.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class SocialSignupRequestDTO {
	private String tempToken;
	private String providerCd;

	// 사용자 정보
	private String userEmail;
	private String userNm;
	private Long userGenderCd;
	private String userPhoneNum;
	private LocalDate userBirthDt;
	private Long userTypeCd;

	// 주소 정보
	private String zonecode;
	private String address;
	private String detailAddress;
	private Long sigunguCode;
	private BigDecimal latitude;
	private BigDecimal longitude;
}
