package com.example.demo.domain.mypage.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class AffiliationInfoUpdateRequestDTO {
    private String userPhoneNum;
    private String companyUrl;
    private String zonecode;
    private String address;
    private String detailAddress;
    private Long sigunguCode;
    private Double latitude;
    private Double longitude;
    private String companyGreetingTxt;
    private List<String> tagNm;
    private String companyIsRecruitingYn;
}