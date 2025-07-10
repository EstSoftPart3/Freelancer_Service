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

	public ApplicationStatusVo findStatusVoByAppSq(Long applicationSq);

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

	List<PersonalApplicantDTO> findPersonalApplicantsByProjectSq(@Param("projectSq") Long projectSq,
			@Param("size") int size,
			@Param("offset") int offset);

	int countPersonalApplicantsByProjectSq(@Param("projectSq") Long projectSq);

	List<String> findDistinctCompanyNamesByProject(@Param("projectSq") Long projectSq,
			@Param("size") int size,
			@Param("offset") int offset);

	List<PersonalApplicantDTO> findApplicantsByProjectAndCompany(@Param("projectSq") Long projectSq,
			@Param("companyNm") String companyNm);

	int countDistinctCompaniesByProject(@Param("projectSq") Long projectSq);

	Long findResumeBySq(@Param("applicationSq") Long applicationSq);

}
