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

    // [추가] 유저의 소속 여부 ('Y' 또는 'N')
    private String isAffiliated;
}
