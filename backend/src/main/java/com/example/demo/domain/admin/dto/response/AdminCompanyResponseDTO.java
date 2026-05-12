package com.example.demo.domain.admin.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminCompanyResponseDTO {
	private Long companySq;		// 번호
	private String companyNm;	// 기업명
	private String companyCeoNm;
	private String companyIsRecruitingYn; // 모집여부 (Y/N)
	private Integer companyViewCnt;	// 조회수
	private String companyRecruitStartDtm;
	
}
