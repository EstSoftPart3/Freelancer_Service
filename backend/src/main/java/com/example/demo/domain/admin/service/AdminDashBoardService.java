package com.example.demo.domain.admin.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.domain.admin.dto.DateCountDTO;
import com.example.demo.domain.admin.dto.response.DayStatsDTO;
import com.example.demo.domain.admin.dto.response.LatestPostsDTO;
import com.example.demo.domain.admin.dto.response.SummaryDTO;
import com.example.demo.domain.admin.mapper.AdminDashBoardMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashBoardService {
	private final AdminDashBoardMapper adminDashBoardMapper;
	
	
	public List<DayStatsDTO> getWeeklyStats() {
		List<DateCountDTO> connectUserList = adminDashBoardMapper.getWeeklyConnectedUserCount();
		List<DateCountDTO> projectList = adminDashBoardMapper.getWeeklyProjectCount();
		List<DateCountDTO> jobList = adminDashBoardMapper.getWeeklyJobCount();
		List<DateCountDTO> postList = adminDashBoardMapper.getWeeklyPostCount();
		List<DateCountDTO> commentList = adminDashBoardMapper.getWeeklyCommentCount();
		
		Map<String, DayStatsDTO> map = new HashMap<>();
		
		for(DateCountDTO d : connectUserList) {
			map.put(d.getDate(), new DayStatsDTO());
			map.get(d.getDate()).setDay(d.getDate());
			map.get(d.getDate()).setVisitors(d.getCount());
		}
		for(DateCountDTO d : projectList) {
			if(map.containsKey(d.getDate())) {
				map.get(d.getDate()).setProjects(d.getCount());
			} else {
				DayStatsDTO dto = new DayStatsDTO();
				dto.setDay(d.getDate());
				dto.setProjects(d.getCount());
				map.put(d.getDate(), dto);
				
			}
		}
		for(DateCountDTO d : jobList) {
			if(map.containsKey(d.getDate())) {
				map.get(d.getDate()).setJobs(d.getCount());
			} else {
				DayStatsDTO dto = new DayStatsDTO();
				dto.setDay(d.getDate());
				dto.setJobs(d.getCount());
				map.put(d.getDate(), dto);
			}
		}
		for(DateCountDTO d : postList) {
			if(map.containsKey(d.getDate())) {
				map.get(d.getDate()).setPosts(d.getCount());
			} else {
				DayStatsDTO dto = new DayStatsDTO();
				dto.setDay(d.getDate());
				dto.setPosts(d.getCount());
				map.put(d.getDate(), dto);
			}
		}
		for(DateCountDTO d : commentList) {
			if(map.containsKey(d.getDate())) {
				map.get(d.getDate()).setComments(d.getCount());
			} else {
				DayStatsDTO dto = new DayStatsDTO();
				dto.setDay(d.getDate());
				dto.setComments(d.getCount());
				map.put(d.getDate(), dto);
			}
		}
		
		for(int i = 0; i <= 6; i++) {
			LocalDate date = LocalDate.now().minusDays(i);
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
			String str = date.format(formatter);
			
			if(!map.containsKey(str)) {
				map.put(str, new DayStatsDTO());
				map.get(str).setDay(str);
				map.get(str).setVisitors(0L);
				map.get(str).setProjects(0L);
				map.get(str).setJobs(0L);
				map.get(str).setPosts(0L);
				map.get(str).setComments(0L);
			}
		}
		
		List<DayStatsDTO> result = new ArrayList<>(map.values());
		result.sort(Comparator.comparing(DayStatsDTO::getDay));
		
		return result;
	}
	
	public List<SummaryDTO> getDayStats() {
		List<SummaryDTO> result = new ArrayList<>();

	    result.add(toSummaryDTO("접속자", adminDashBoardMapper.getDayConnectedUserCount()));
	    result.add(toSummaryDTO("프로젝트", adminDashBoardMapper.getDayProjectCount()));
	    result.add(toSummaryDTO("채용", adminDashBoardMapper.getDayJobCount()));
	    result.add(toSummaryDTO("게시글", adminDashBoardMapper.getDayPostCount()));
	    result.add(toSummaryDTO("댓글", adminDashBoardMapper.getDayCommentCount()));

	    return result;
	}
	
	private SummaryDTO toSummaryDTO(String title, List<DateCountDTO> list) {
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	    String today = LocalDate.now().format(formatter);

	    Long todayCount = 0L;
	    Long yesterdayCount = 0L;

	    for (DateCountDTO d : list) {
	        if (d.getDate().equals(today)) {
	            todayCount = d.getCount();
	        } else {
	            yesterdayCount = d.getCount();
	        }
	    }

	    Double percent = yesterdayCount == 0 ? 0.0d
	            : (todayCount - yesterdayCount) / (double) yesterdayCount * 100d;

	    return SummaryDTO.builder()
	            .title(title)
	            .count(todayCount)
	            .percent(percent)
	            .build();
	}
	
	public List<LatestPostsDTO> getLatestPosts() {	
		return adminDashBoardMapper.getLatestPosts();
	}
}
	
