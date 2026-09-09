package com.example.demo.domain.affiliation.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

import com.example.demo.domain.affiliation.entity.*;
import com.example.demo.domain.mypage.dto.UserInfoDTO;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse{
//	소속 지원 정보 (개인)
	private Long sq; // 지원 순번
    private Long companySq; // 회사 순번
    private String companyNm; // 회사명
    private Long resumeSq; // 이력서 순번
    private String resumeTtl; // 이력서 제목
    private Long applicationSq; // 지원 순번
    private LocalDateTime createdAt; // 지원 일자
    private Long applicantCnt; // 지원자 수
    private LocalDateTime readAt; // 열람 일자
    private Long statusCd; // 지원 상태 코드
    private String isDeleted; // 지원 취소 여부
    private String greeting;
    
    public static ApplicationResponse fromEntity(Company company, String resumeTtl, CompanyApplication companyApplication, Long applicantCnt) {
    	return new ApplicationResponse(
			companyApplication.getCompanyApplicationSq(),
			company.getCompanySq(),
			company.getCompanyNm(),
			companyApplication.getResumeSq(),
			resumeTtl,
			companyApplication.getCompanyApplicationSq(),
			companyApplication.getCompanyApplicationCreatedAtDtm(),
			applicantCnt,
			companyApplication.getCompanyApplicationReadAtDtm(),
			companyApplication.getCompanyApplicationStatusCd(),
			companyApplication.getCompanyApplicationIsDeletedYn(),
			companyApplication.getCompanyApplicationGreetingTxt()
			
		);
    }
}