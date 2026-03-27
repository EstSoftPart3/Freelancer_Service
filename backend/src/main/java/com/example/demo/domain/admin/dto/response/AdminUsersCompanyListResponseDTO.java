package com.example.demo.domain.admin.dto.response;

import lombok.*;


/**
 * 관리자가 회사 소속 정보를 위해 필요한 DTO
 */

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsersCompanyListResponseDTO {
    // 유저 정보
    private Long userTypeCd;
    private Long userSq;
    private String userId;
    private String userNm;
    private String userPhoneNum;

    // 회사 정보
    private Long companySq;
    private String companyNm;
    private String companyCeoNm;
    private String companyOpenDt;
    private String companyUrl;
    private String companyBizNum;

    // 주소 정보 (tbl_address_s 조인)
//    private Long companyZonecode;
    private String companyAddress;
    private String companyDetailAddress;
//    private String companySigungu;
}
