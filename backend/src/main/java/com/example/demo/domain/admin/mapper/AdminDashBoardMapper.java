package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.admin.dto.DateCountDTO;
import com.example.demo.domain.admin.dto.response.LatestPostsDTO;

@Mapper
public interface AdminDashBoardMapper {
	
	List<DateCountDTO> getWeeklyConnectedUserCount();
	
	List<DateCountDTO> getWeeklyProjectCount();
	
	List<DateCountDTO> getWeeklyJobCount();
	
	List<DateCountDTO> getWeeklyPostCount();
	
	List<DateCountDTO> getWeeklyCommentCount();
	
	List<DateCountDTO> getDayConnectedUserCount();
	
	List<DateCountDTO> getDayProjectCount();
	
	List<DateCountDTO> getDayJobCount();
	
	List<DateCountDTO> getDayPostCount();
	
	List<DateCountDTO> getDayCommentCount();
	
	void insertConnectedUser(Long user_sq);
	
	List<LatestPostsDTO> getLatestPosts();
}
