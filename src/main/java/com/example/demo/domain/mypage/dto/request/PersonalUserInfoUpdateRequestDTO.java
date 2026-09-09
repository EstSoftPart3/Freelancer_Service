package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class PersonalUserInfoUpdateRequestDTO {
    private String userPw;
    private String userEmail;
    private String userPhoneNum;

    private String zonecode;
    private String address;
    private String detailAddress;
    private Long sigunguCode;
    private Double latitude;
    private Double longitude;
}
