package com.example.demo.domain.mypage.dto;

import lombok.Data;

@Data
public class CompanyInfoDTO {
    private Long companySq;
    private Long addressSq;
    private String companyNm;
    private String companyCeoNm;
    private String companyOpenDt; // yyyy-MM-dd 형식의 문자열
    private String companyUrl;
    private String companyGreetingTxt;
    private String companyIsRecruitingYn;
}
