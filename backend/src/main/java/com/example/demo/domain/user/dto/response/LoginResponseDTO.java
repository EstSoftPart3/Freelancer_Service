package com.example.demo.domain.user.dto.response;

import com.example.demo.domain.user.dto.TokenDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private String userNm;
    private Long userTypeCd;

    private TokenDTO token;

    // [추가] 프론트엔드에서 거리 계산의 기준이 될 좌표
    private Double latitude;
    private Double longitude;

    // 소셜 로그인 신규 사용자 여부
    private Boolean isNewUser;
    private String tempToken;
}
