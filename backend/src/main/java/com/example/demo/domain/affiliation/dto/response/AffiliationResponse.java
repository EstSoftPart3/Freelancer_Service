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
    private Double distance; // 사용자로부터의 거리
    private Double comLatitude; // 기업 위도
    private Double comLongitude; // 기업 경도 
    


    public static AffiliationResponse fromEntity(Company company, Address address, List<String> tags, Long scrapCnt, Boolean isScrap, Boolean isApply, String imgUrl) {
    	LocalDate today = LocalDate.now();
        Period period = Period.between(company.getCompanyOpenDt(), today);
    	Integer openYear = period.getYears();
        return new AffiliationResponse(
        		company.getCompanySq(),
        		company.getCompanyNm(),
        		company.getCompanyCeoNm(),
        		imgUrl,
        		(address != null) ? address.getAddress(): null,
        		company.getCompanyOpenDt(),
        		openYear,
        		company.getCompanyGreetingTxt(),
        		tags,
        		company.getCompanyViewCnt(),
        		scrapCnt,
        		isScrap,
        		isApply,
        		null,
        		null, 
        		null, 
        		null, 
        		null
        		
        );
    }
    
    public static AffiliationResponse fromEntityScrap(Company company, Address address, List<String> tags, Long memberCnt, Boolean isApply) {
    	LocalDate today = LocalDate.now();
        Period period = Period.between(company.getCompanyOpenDt(), today);
    	Integer openYear = period.getYears();
        return new AffiliationResponse(
        		company.getCompanySq(),
        		company.getCompanyNm(),
        		company.getCompanyCeoNm(),
        		company.getCompanyProfileImageUrl(),
        		(address != null) ? address.getAddress(): null,
        		company.getCompanyOpenDt(),
        		openYear,
        		company.getCompanyGreetingTxt(),
        		tags,
        		company.getCompanyViewCnt(),
        		null,
        		null,
        		isApply,
        		memberCnt,
        		company.getCompanyIsRecruitingYn(),
        		null,
        		null,
        		null
        		
        );
    	
    }
    // 위치 기반 서비스 제공을 위한 DTO 오버로딩
    public static AffiliationResponse fromEntity(Company company, Address address, List<String> tags, Long scrapCnt, Boolean isScrap, Boolean isApply, String imgUrl, Double distance, Double comLatitude, Double comLongitude) {
    	LocalDate today = LocalDate.now();
        Period period = Period.between(company.getCompanyOpenDt(), today);
    	Integer openYear = period.getYears();
        return new AffiliationResponse(
        		company.getCompanySq(),
        		company.getCompanyNm(),
        		company.getCompanyCeoNm(),
        		imgUrl,
        		(address != null) ? address.getAddress(): null,
        		company.getCompanyOpenDt(),
        		openYear,
        		company.getCompanyGreetingTxt(),
        		tags,
        		company.getCompanyViewCnt(),
        		scrapCnt,
        		isScrap,
        		isApply,
        		null,
        		null,
        		distance, 
        		comLatitude, 
        		comLongitude
        		
        );
    }
    
    public static AffiliationResponse fromEntityScrap(Company company, Address address, List<String> tags, Long memberCnt, Boolean isApply, Double distance) {
    	LocalDate today = LocalDate.now();
        Period period = Period.between(company.getCompanyOpenDt(), today);
    	Integer openYear = period.getYears();
        return new AffiliationResponse(
        		company.getCompanySq(),
        		company.getCompanyNm(),
        		company.getCompanyCeoNm(),
        		company.getCompanyProfileImageUrl(),
        		(address != null) ? address.getAddress(): null,
        		company.getCompanyOpenDt(),
        		openYear,
        		company.getCompanyGreetingTxt(),
        		tags,
        		company.getCompanyViewCnt(),
        		null,
        		null,
        		isApply,
        		memberCnt,
        		company.getCompanyIsRecruitingYn(),
        		distance,
        		(address!=null && address.getLatitude()!=null) ? address.getLatitude().doubleValue() : null,
        		(address!=null && address.getLongitude()!=null) ? address.getLongitude().doubleValue() :null
        );
    	
    }
}