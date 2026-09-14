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
	
	// dashboardTypeCds: 대시보드 게시글 지표에 포함할 유형 화이트리스트(고객의 소리 제외).
	// BoardTypeCode.communityListCodes() + NOTICE에서 온다 — 새 게시판 유형이 늘어도
	// XML을 고치지 않고 지표에 자동으로 잡힌다.
	List<DateCountDTO> getChartPostCount(@Param("startDate") String startDate, @Param("endDate") String endDate,
			@Param("dashboardTypeCds") List<Long> dashboardTypeCds);

	List<DateCountDTO> getChartCommentCount(@Param("startDate") String startDate,@Param("endDate") String endDate);

	List<DateCountDTO> getDayConnectedUserCount();

	List<DateCountDTO> getDayProjectCount();

	List<DateCountDTO> getDayProjectApplicationCount();

	List<DateCountDTO> getDayCompanyApplicationCount();

	List<DateCountDTO> getDayPostCount(@Param("dashboardTypeCds") List<Long> dashboardTypeCds);

	List<DateCountDTO> getDayCommentCount();

	void insertConnectedUser(Long user_sq);

	List<LatestPostsDTO> getLatestPosts(@Param("dashboardTypeCds") List<Long> dashboardTypeCds);
}
