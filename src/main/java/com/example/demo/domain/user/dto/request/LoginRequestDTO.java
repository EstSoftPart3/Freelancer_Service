package com.example.demo.domain.user.dto.request;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String userId;
    private String userPw;
    private Long userTypeCd;
    private boolean autoLogin;
}