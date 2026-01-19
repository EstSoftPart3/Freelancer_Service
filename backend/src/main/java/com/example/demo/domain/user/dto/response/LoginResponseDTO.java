package com.example.demo.domain.user.dto.response;

import com.example.demo.domain.user.dto.TokenDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
	private Long userSq;
	private String userId;
    private String userNm;
    private String userEmail;
    private String socialId;
    private Long userTypeCd;
    private TokenDTO token;
}
