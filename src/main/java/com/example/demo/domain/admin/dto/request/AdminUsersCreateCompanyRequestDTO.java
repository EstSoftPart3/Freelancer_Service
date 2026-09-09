package com.example.demo.domain.admin.dto.request;

import java.time.LocalDate;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsersCreateCompanyRequestDTO {
    private Long companySq;
    private Long userSq;
    private Long addressSq;
    private String companyNm;
    private String companyCeoNm;
    private String companyBizNum;
    private LocalDate companyOpenDt;
    private String companyUrl;
    private String companyAddress;
    private String companyDetailAddress;
    private String companySigungu;
    private String companyZonecode;
    private BigDecimal companyLatitude;
    private BigDecimal companyLongitude;
    private String userPhoneNum;
    private Long companyAuthStatusCd;
}
