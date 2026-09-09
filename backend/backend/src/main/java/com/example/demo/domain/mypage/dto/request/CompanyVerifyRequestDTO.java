package com.example.demo.domain.mypage.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyVerifyRequestDTO {
    private String companyNm; // b_nm (상호)
    private String companyCeoNm; // p_nm (대표자명)
    private String companyBizNum; // b_no (사업자번호)
    private String companyOpenDt; // start_dt (개업일자, YYYYMMDD 형식 문자열)
}