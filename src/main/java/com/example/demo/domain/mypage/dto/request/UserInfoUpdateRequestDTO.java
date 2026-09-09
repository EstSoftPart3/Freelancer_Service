package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class UserInfoUpdateRequestDTO {
    private PersonalUserInfoUpdateRequestDTO personal;
    private CompanyUserInfoUpdateRequestDTO company;
}
