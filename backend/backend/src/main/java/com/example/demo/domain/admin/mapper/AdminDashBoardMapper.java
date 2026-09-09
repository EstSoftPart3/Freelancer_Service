package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.DateCountDTO;
import com.example.demo.domain.admin.dto.response.LatestPostsDTO;

@Mapper
public interface AdminDashBoardMapper {
	
	List<DateCountDTO> getChartConnectedUserCount(@Param("startDate") String startDate,@Param("endDate") String endDate);
	
	List<DateCountDTO> getChartProjectCount(@Param("startDate") String startDate,@Param("endDate") String endDate);
	
	List<DateCountDTO> getChartProjectApplicationCount(@Param("startDate") String startDate,@Param("endDate") String endDate);
	
	List<DateCountDTO> getChartCompanyApplicationCount(@Param("startDate") String startDate,@Param("endDate") String endDate);
	
	List<DateCountDTO> getChartPostCount(@Param("startDate") String startDate,@Param("endDate") String endDate);
	
	List<DateCountDTO> getChartCommentCount(@Param("startDate") String startDate,@Param("endDate") String endDate);
	
	List<DateCountDTO> getDayConnectedUserCount();
	
	List<DateCountDTO> getDayProjectCount();
	
	List<DateCountDTO> getDayProjectApplicationCount();
	
	List<DateCountDTO> getDayCompanyApplicationCount();
	
	List<DateCountDTO> getDayPostCount();
	
	List<DateCountDTO> getDayCommentCount();
	
	void insertConnectedUser(Long user_sq);
	
	List<LatestPostsDTO> getLatestPosts();
}
