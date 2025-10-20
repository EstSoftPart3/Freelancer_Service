package com.example.demo.domain.user.dto.response;

import com.example.demo.domain.user.dto.TokenDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    // 인턴 추가 작업: userSq 필드 추가
    private Long userSq;
    private String userNm;
    private Long userTypeCd;
    private TokenDTO token;
}
