package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class ResumeCertificateRequest {
	  private String certificationNm;       // 자격증 이름
	  private String certificationIssuerNm; // 발행 기관 이름
}
