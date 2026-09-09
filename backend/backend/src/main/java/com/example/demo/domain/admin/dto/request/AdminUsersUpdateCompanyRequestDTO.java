package com.example.demo.domain.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 관리자가 회사 정보를 수정할 때 사용하는 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsersUpdateCompanyRequestDTO {
    private String companyNm;
    private String companyCeoNm;
    private String companyBizNum;
    private LocalDate companyOpenDt;
    private String companyUrl;
    private String companyAddress;
    private String companyDetailAddress;
    private String userPhoneNum;
    private Long companyAuthStatusCd;
}
