package com.example.demo.domain.user.dto.request;

import lombok.Data;

@Data
public class ResetPasswordVerifyRequestDTO {
    private String userId;
    private String name;
    private String email;
}
