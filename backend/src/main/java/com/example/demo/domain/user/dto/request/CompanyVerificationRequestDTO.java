package com.example.demo.domain.user.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyVerificationRequestDTO {

    @JsonProperty("b_no") // 사업자등록번호
    private String bNo;

    @JsonProperty("start_dt") // 개업일자 (YYYYMMDD)
    private String startDt;

    @JsonProperty("p_nm") // 대표자 성명
    private String pNm;

    @JsonProperty("b_nm") // 상호명
    private String bNm;

}