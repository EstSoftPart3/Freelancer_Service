package com.example.demo.domain.mypage.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyDTO {
    private Long companySq;
    private String companyNm;
}
