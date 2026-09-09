package com.example.demo.domain.mypage.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationPassDTO {
    private Long companyApplicationSq; // 지원 고유번호
    private Long companySq; // 기업 고유번호
    private Long userSq; // 사용자 고유번호
    private Long resumeSq; // 이력서 고유번호
    private Long companyApplicationStatusCd; // 지원 상태 코드 (502: 합격, 503: 불합격)
}
