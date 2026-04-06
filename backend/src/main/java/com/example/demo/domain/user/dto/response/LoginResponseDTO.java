package com.example.demo.domain.user.dto.response;

import com.example.demo.domain.user.dto.TokenDTO;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private Long userSq;
    private String userNm;
    private Long userTypeCd;

    private TokenDTO token;

    // [추가] 프론트엔드에서 거리 계산의 기준이 될 좌표
    private BigDecimal latitude;
    private BigDecimal longitude;

    // [추가] 유저의 소속 여부 ('Y' 또는 'N')
    private String isAffiliated;

    // [추가] 소속 회사 SQ (소속 중인 회사가 없으면 null)
    private Long affiliatedCompanySq;

    // [추가] 기업 인증 상태 코드 (2501: 미인증, 2502: 인증완료)
    private Long companyAuthStatusCd;
}
