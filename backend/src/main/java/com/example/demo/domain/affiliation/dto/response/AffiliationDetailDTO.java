package com.example.demo.domain.affiliation.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AffiliationDetailDTO {
	// 기업 순번
	private Long companySq;
	// 기업명
	private String companyNm;
	// 대표자명
	private String companyCeoNm;
	// 개업 일자
	private LocalDate companyOpenDt;
	// 주소 순번
	private Long addressSq;
	// 기업 URL
	private String companyUrl;
	// 사업자등록번호
	private String companyBizNum;
	//모집여부 Y
	private String companyIsRecruitingYn;
	// 인사말
	private String companyGreetingTxt;
	// 조회수
	private int companyViewCnt;
	// 기업 주소지
	private String address;
	// 기업 주소 (상세 주소)
	private String detailAddress;
	// 프로젝트 리스트
    private List<AffiliationProjectDTO> projects;
    
    // 소속 여부
    private boolean isMember;
    // 선청 여부
    private boolean isApply;
}
