package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.response.DayStatsDTO;
import com.example.demo.domain.admin.dto.response.LatestPostsDTO;
import com.example.demo.domain.admin.dto.response.SummaryDTO;
import com.example.demo.domain.admin.service.AdminDashBoardService;
import com.example.demo.domain.user.service.LoginService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashBoardController {
	private final AdminDashBoardService adminDashBoardService;
	
	@GetMapping("/weekly")
	public ResponseEntity<ApiResponse<List<DayStatsDTO>>> getWeeklyData(){
		List<DayStatsDTO> weeklyStats = adminDashBoardService.getWeeklyStats();
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "최근 7일간 목록 조회 성공", weeklyStats));
	}
	
	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<List<SummaryDTO>>> getDayData() {
		List<SummaryDTO> dayStats = adminDashBoardService.getDayStats();
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "일일 목록 조회 성공", dayStats));
	}
	
	@GetMapping("/latestpost")
	public ResponseEntity<ApiResponse<List<LatestPostsDTO>>> getLatestPostsData() {
		List<LatestPostsDTO> latestPostsList = adminDashBoardService.getLatestPosts();
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "최근 5개 게시글 조회 성공", latestPostsList));
	}
}
