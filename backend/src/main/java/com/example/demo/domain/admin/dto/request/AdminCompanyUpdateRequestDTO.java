package com.example.demo.domain.admin.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminCompanyUpdateRequestDTO {
	
	private Long companySq;		// Service에서 셋팅
	
	private String companyNm;	// 기업명
	private String companyCeoNm;	// 대표자명
	private String companyBizNum;	// 사업자번호
	private String companyOpenDt;	// 개업일자
	private String companyIsRecruitingYn;	// 모집여부
	private String companyRecruitStartDtm;	// 공고시작일
}
