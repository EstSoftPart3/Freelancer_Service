package com.example.demo.domain.admin.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.service.AdminProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {
	private final AdminProjectService adminProjectService;
	
	@GetMapping("/project")
	public ResponseEntity<ApiResponse<?>> getProjects(){
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 조회 성공", adminProjectService.getProjects()));
	}
}
