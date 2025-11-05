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
    // 인턴 수정: 계정 활성화 상태 필드 추가
    // 수정 내용: userIsActivateYn 필드 추가 (Y: 활성화, N: 비활성화)
    // 수정 사유: 관리자가 비활성화한 계정의 로그인을 차단하기 위해 필요
    private String userIsActivateYn;
}
