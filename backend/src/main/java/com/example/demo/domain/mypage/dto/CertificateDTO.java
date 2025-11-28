package com.example.demo.domain.mypage.dto;

import lombok.Data;

@Data
public class CertificateDTO {
    private Long certificateCd; // jmcd
    private String certificateNm; // jmfldnm
    private Long middleObligationFieldCd; // mdobligfldcd
    private String middleObligationFieldNm; // mdobligfldnm
    private Long obligationFieldCd; // obligfldcd
    private String obligationFieldNm; // obligfldnm
    private Long qualificationGroupCd; // qualgbcd
    private String qualificationGroupNm; // qualgbnm
    private Long seriesCd; // seriescd
    private String seriesNm; // seriesnm
    // getters / setters
}