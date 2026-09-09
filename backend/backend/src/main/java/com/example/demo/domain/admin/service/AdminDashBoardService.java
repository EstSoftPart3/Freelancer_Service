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
	
	
	public List<DayStatsDTO> getChartStats(String startDate, String endDate) {
		List<DateCountDTO> connectUserList = adminDashBoardMapper.getChartConnectedUserCount(startDate, endDate);
		List<DateCountDTO> projectList = adminDashBoardMapper.getChartProjectCount(startDate, endDate);
		List<DateCountDTO> projectApplicationList = adminDashBoardMapper.getChartProjectApplicationCount(startDate, endDate);
		List<DateCountDTO> companyApplicationList = adminDashBoardMapper.getChartCompanyApplicationCount(startDate, endDate);
		List<DateCountDTO> postList = adminDashBoardMapper.getChartPostCount(startDate, endDate);
		List<DateCountDTO> commentList = adminDashBoardMapper.getChartCommentCount(startDate, endDate);

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
		for(DateCountDTO d : projectApplicationList) {
			if(map.containsKey(d.getDate())) {
				map.get(d.getDate()).setProjectApplications(d.getCount());
			} else {
				DayStatsDTO dto = new DayStatsDTO();
				dto.setDay(d.getDate());
				dto.setProjectApplications(d.getCount());
				map.put(d.getDate(), dto);
			}
		}
		for(DateCountDTO d : companyApplicationList) {
			if(map.containsKey(d.getDate())) {
				map.get(d.getDate()).setCompanyApplications(d.getCount());
			} else {
				DayStatsDTO dto = new DayStatsDTO();
				dto.setDay(d.getDate());
				dto.setCompanyApplications(d.getCount());
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

		LocalDate start = LocalDate.parse(startDate);
		LocalDate end = LocalDate.parse(endDate);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
		    String str = date.format(formatter);

		    if (!map.containsKey(str)) {
		        DayStatsDTO dto = new DayStatsDTO();
		        dto.setDay(str);
		        dto.setVisitors(0L);
		        dto.setProjects(0L);
		        dto.setProjectApplications(0L);
		        dto.setCompanyApplications(0L);
		        dto.setPosts(0L);
		        dto.setComments(0L);
		        map.put(str, dto);
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
	    result.add(toSummaryDTO("프로젝트 지원", adminDashBoardMapper.getDayProjectApplicationCount()));
	    result.add(toSummaryDTO("소속 지원", adminDashBoardMapper.getDayCompanyApplicationCount()));
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
	            : Math.round((todayCount - yesterdayCount) / (double) yesterdayCount * 100);

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
	
