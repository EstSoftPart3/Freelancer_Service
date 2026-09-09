package com.example.demo.domain.user.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class UserDTO {
    private Long userSq;
    private Long addressSq;
    private String userId;
    private String userEmail;
    private String userPw;
    private String userNm;
    private Long userGenderCd;
    private String userPhoneNum;
    private LocalDate userBirthDt;
    private Long userTypeCd;
    private Long userSignupTypeCd;
    private String userIsDeletedYn;
}
