package com.example.demo.domain.admin.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminCompanyCreateRequestDTO {
	
	private Long userSq;
	private Long addressSq;
	
	// Form에서 받음
	private String companyNm;
	private String companyCeoNm;
	private String companyBizNum;
	private String companyOpenDt;
	private String companyIsRecruitingYn;
	
	// 폼에서 받음 - 주소 정보
	private Long zonecode;
	private String address;
	private String detailAddress;
	private String sigungu;
	private Double latitude;
	private Double longitude;
	private Long areaCodeSq;
	
}
