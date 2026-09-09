package com.example.demo.domain.mypage.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class UserInfoDTO {
    private Long userSq;
    private String userId;
    private String userEmail;
    private String userNm;
    private Date userBirthDt;
    private Long userGenderCd;
    private String userPhoneNum;
    private Long userTypeCd;
    private String userProfileImageUrl;
    private Long addressSq;
}
