package com.example.demo.domain.affiliation.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.affiliation.entity.*;
import com.example.demo.domain.mypage.dto.ApplicationPassDTO;
import com.example.demo.domain.affiliation.dto.request.SearchFilterRequest;
import java.util.*;

@Mapper
public interface AffiliationMapper {

	// 소속 공고 목록 조회
	List<Company> findAll(@Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("sortType") String sortType,
			@Param("addressCd") Long addressCd, @Param("page") Long page, @Param("size") Long size,
			@Param("offset") Long offset);

	Long findAllCnt(SearchFilterRequest searchFilter);

	Address findAddress(@Param("addressSq") Long addressSq);

	List<String> findTags(@Param("companySq") Long companySq);

	Long findScrapCnt(@Param("companySq") Long companySq);

	String findProfileImg(@Param("companySq") Long companySq);

	// 스크랩 리스트
	List<Company> findScrapAffiliations(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword,
			@Param("page") Long page, @Param("size") Long size, @Param("offset") Long offset);

	Long findScrapAffiliationsCnt(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword);

	Long findAffiliationMemberCnt(@Param("companySq") Long companySq);

	// 소속 스크랩
	Scrap findScrap(@Param("userSq") Long userSq, @Param("companySq") Long companySq);

	void insertScrap(Scrap scrap);

	void deleteScrap(@Param("scrapSq") Long scrapSq);

	// 소속 조회수 증가
	void addViewCnt(@Param("companySq") Long companySq);

	// 소속 신청
	void insertApplication(CompanyApplication companyApplication);

	// 소속 신청 내용 수정
	void updateApplication(CompanyApplication companyApplication);

	// 소속 신청 내역 상세 조회
	CompanyApplication findApplication(@Param("companyApplicationSq") Long companyApplicationSq);

	// 해당 소속에 신청했는지 여부
	Long findIsApply(@Param("userSq") Long userSq, @Param("companySq") Long companySq);

	// 소속 신청 열람 상태 변경
	void updateReadAt(@Param("companyApplicationSq") Long companyApplicationSq);

	// 회사별 소속 신청 내역 전체 조회
	List<CompanyApplication> findApplicants(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword,
			@Param("readType") String readType, @Param("page") Long page, @Param("size") Long size,
			@Param("offset") Long offset);

	Long findApplicantsCnt(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword);

	Long findApplicantsReadCnt(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword);

	String findUserNm(@Param("resumeSq") Long resumeSq); // 이름 조회

	List<Career> findCareers(@Param("resumeSq") Long resumeSq); // 경력 조회

	// 회원별 소속 신청 내역 전체 조회
	List<CompanyApplication> findApplicationByUserSq(@Param("userSq") Long userSq,
			@Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("readType") String readType, @Param("page") Long page, @Param("size") Long size,
			@Param("offset") Long offset);

	Long findApplicationByUserSqCnt(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword);

	Long findApplicationByUserSqReadCnt(@Param("userSq") Long userSq, @Param("searchType") String searchType,
			@Param("keyword") String keyword);

	Company findCompany(@Param("companySq") Long companySq);

	String findResumeTtl(@Param("resumeSq") Long resumeSq); // 이력서 이름 조회

	Long findApplicantCnt(@Param("companySq") Long companySq); // 지원자 수 조회

	// 스킬 태그 조회
	List<ResumeSkillTag> findResumeSkills(@Param("resumeSq") Long resumeSq);

	// 지원 취소
	void deleteApplication(@Param("companyApplicationSq") Long companyApplicationSq);

	// 주소 리스트 조회
	List<AreaCd> findAddressCds();
	
	// 특정 회사를 스크랩하고 있는 모든 유저 조회
	List<Long> findScrappersByCompanySq(@Param("companySq") Long companySq,
										@Param("scrapTypeCd") Long scrapTypeCd);

}