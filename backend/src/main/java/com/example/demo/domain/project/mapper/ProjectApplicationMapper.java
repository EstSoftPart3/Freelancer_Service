package com.example.demo.domain.project.mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.project.dto.PersonalApplicantDTO;
import com.example.demo.domain.project.vo.ApplicationStatusVo;
import com.example.demo.domain.project.vo.ApplicationSummary;

@Mapper
public interface ProjectApplicationMapper {

	public LocalDateTime findInterviewTimeBySq(@Param("interviewSq") Long interviewSq);

	List<ApplicationSummary> findApplicationSummariesByUserSqWithFilter(
			@Param("userSq") Long userSq,
			@Param("offset") int offset,
			@Param("size") int size,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword,
			@Param("readType") String readType);

	int countApplicationSummariesByUserSqWithFilter(
			@Param("userSq") Long userSq,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword,
			@Param("readType") String readType);

	List<Map<String, Object>> countApplicationsByReadStatus(@Param("userSq") Long userSq);

	public Long findProjectBySq(Long appSq);

	public Long findCompanyBySq(Long appSq);

	public Long findByProAndUser(@Param("projectSq") Long projectSq, @Param("userSq") Long userSq);

	public Long findByProAndCom(@Param("projectSq") Long projectSq, @Param("companySq") Long companySq);

	public List<Long> findAllSqByProjectSq(Long projectSq);

	public String findMmTypStrBySq(Long applicationSq);

	public void updateApplicationStatus(
			@Param("newStatusCd") Long newStatusCd,
			@Param("applicationSq") Long applicationSq);

	public void updateInterviewTimeSelected(
			@Param("interviewSq") Long interviewSq);

	public void updateApplicationInterviewTimeAndStatus(
			@Param("applicationSq") Long applicationSq,
			@Param("interviewTime") LocalDateTime interviewTime);

	// 개인 지원자 조회
	List<PersonalApplicantDTO> findPersonalApplicantsByProjectSq(
			@Param("projectSq") Long projectSq,
			@Param("filter") String filter,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword,
			@Param("size") int size,
			@Param("offset") int offset);

	int countPersonalApplicantsByProjectSq(
			@Param("projectSq") Long projectSq,
			@Param("filter") String filter,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword);

	// 기업명 리스트 조회 (페이징)
	List<String> findDistinctCompanyNamesByProject(
			@Param("projectSq") Long projectSq,
			@Param("filter") String filter,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword,
			@Param("size") int size,
			@Param("offset") int offset);

	// 특정 회사별 지원자 리스트 조회
	List<PersonalApplicantDTO> findApplicantsByProjectAndCompany(
			@Param("projectSq") Long projectSq,
			@Param("companyNm") String companyNm,
			@Param("filter") String filter,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword);

	// 기업명 전체 개수 조회
	int countDistinctCompaniesByProject(
			@Param("projectSq") Long projectSq,
			@Param("filter") String filter,
			@Param("searchType") String searchType,
			@Param("keyword") String keyword);

	// 지원서에서 resumeSq 조회 (개인/기업 공통)
	Long findResumeBySq(@Param("applicationSq") Long applicationSq);

	// 지원 상태 조회
	ApplicationStatusVo findStatusVoByAppSq(@Param("applicationSq") Long applicationSq);

}
