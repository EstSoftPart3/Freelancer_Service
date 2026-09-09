package com.example.demo.domain.affiliation.dto.response;

import lombok.*;
import java.util.*;
import java.time.*;

import com.example.demo.domain.affiliation.entity.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AffiliationResponse{
	private Long sq; // 기업 순번 (기업 테이블)
    private String companyNm; // 회사명 (기업 테이블)
    private String ceoNm; // 대표자명 (기업 테이블)
    private String profileImg; // 기업 프로필 이미지 (기업 테이블)
    private String address; // 주소 (주소 테이블에서 companySq으로 검색)
    private LocalDate openDt; // 개업일자
    private Integer openYear; // 개업년수 (기업 테이블에서 company_open_dt로 계산)
    private String greeting; // 회사 설명 (기업 테이블)
    private List<String> tags; // 관련 태그 (기업 태그 테이블)
    private Long viewCnt; // 조회수 (기업 테이블)
    private Long scrapCnt; // 스크랩 수 (스크랩 테이블)
    private Boolean isScrap; // 스크랩 여부
    private Boolean isApply; // 지원 여부
    private Long memberCnt; // 소속 직원 수
    private String isRecruitingYn;
    


    public static AffiliationResponse fromEntity(Company company, Address adress, List<String> tags, Long scrapCnt, Boolean isScrap, Boolean isApply, String imgUrl) {
    	LocalDate today = LocalDate.now();
        Period period = Period.between(company.getCompanyOpenDt(), today);
    	Integer openYear = period.getYears();
        return new AffiliationResponse(
        		company.getCompanySq(),
        		company.getCompanyNm(),
        		company.getCompanyCeoNm(),
        		imgUrl,
        		adress.getAddress(),
        		company.getCompanyOpenDt(),
        		openYear,
        		company.getCompanyGreetingTxt(),
        		tags,
        		company.getCompanyViewCnt(),
        		scrapCnt,
        		isScrap,
        		isApply,
        		null,
        		null
        		
        );
    }
    
    public static AffiliationResponse fromEntityScrap(Company company, Address adress, List<String> tags, Long memberCnt, Boolean isApply) {
    	LocalDate today = LocalDate.now();
        Period period = Period.between(company.getCompanyOpenDt(), today);
    	Integer openYear = period.getYears();
        return new AffiliationResponse(
        		company.getCompanySq(),
        		company.getCompanyNm(),
        		company.getCompanyCeoNm(),
        		company.getCompanyProfileImageUrl(),
        		adress.getAddress(),
        		company.getCompanyOpenDt(),
        		openYear,
        		company.getCompanyGreetingTxt(),
        		tags,
        		company.getCompanyViewCnt(),
        		null,
        		null,
        		isApply,
        		memberCnt,
        		company.getCompanyIsRecruitingYn()
        		
        );
    	
    }
}