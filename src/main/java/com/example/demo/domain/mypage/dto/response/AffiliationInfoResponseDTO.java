package com.example.demo.domain.mypage.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.domain.mypage.dto.AddressDTO;
import com.example.demo.domain.mypage.dto.CompanyInfoDTO;
import com.example.demo.domain.mypage.dto.InformationEditAddressDTO;
import com.example.demo.domain.mypage.dto.UserInfoDTO;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AffiliationInfoResponseDTO {
    private String companyNm;
    private String companyCeoNm;
    private String companyOpenDt;
    private String companyUrl;
    private String companyGreetingTxt;
    private String companyIsRecruitingYn;
    private String companyProfileImageUrl;
    private String userPhoneNum;
    private String zonecode;
    private String address;
    private String detailAddress;
    private Long sigunguCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> tagNm;

    public static AffiliationInfoResponseDTO of(
            CompanyInfoDTO company,
            UserInfoDTO user,
            InformationEditAddressDTO address,
            List<String> tags,
            String companyProfileImageUrl) {
        return AffiliationInfoResponseDTO.builder()
                .companyNm(company.getCompanyNm())
                .companyCeoNm(company.getCompanyCeoNm())
                .companyOpenDt(company.getCompanyOpenDt())
                .companyUrl(company.getCompanyUrl())
                .companyGreetingTxt(company.getCompanyGreetingTxt())
                .companyIsRecruitingYn(company.getCompanyIsRecruitingYn())
                .companyProfileImageUrl(companyProfileImageUrl)
                .userPhoneNum(user.getUserPhoneNum())
                .zonecode(address.getZonecode())
                .address(address.getAddress())
                .detailAddress(address.getDetailAddress())
                .sigunguCode(address.getAreaCodeSq())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .tagNm(tags)
                .build();
    }
}
