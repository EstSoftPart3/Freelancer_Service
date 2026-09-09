package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class PasswordCheckRequestDTO {
    private Long userSq;
    private String currentPassword;
}
