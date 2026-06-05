package com.example.demo.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.request.AdminAuditListRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminAuditDetailResponseDTO;
import com.example.demo.domain.admin.dto.response.AdminAuditListResponseDTO;
import com.example.demo.domain.admin.service.AdminAuditService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/audit/logs")
@RequiredArgsConstructor
public class AdminAuditController {
	
	private final AdminAuditService adminAuditService;
	
	@GetMapping
	public ResponseEntity<ApiResponse<AdminAuditListResponseDTO>> getAuditLogs(
			@ModelAttribute AdminAuditListRequestDTO requestDTO) {
		
		log.info("활동 로그 목록 조회 요청 - 페이지: {}, 검색어 {}", requestDTO.getPage(),
				requestDTO.getKeyword());
		
		AdminAuditListResponseDTO response = adminAuditService.getAuditLogs(requestDTO);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "활동 로그 목록 조회 성공", response));
		
	}
	
	@GetMapping("/{logSq}")
	public ResponseEntity<ApiResponse<AdminAuditDetailResponseDTO>> getAuditLogDetail(
			@PathVariable("logSq") Long logSq) {
		
		log.info("활동 로그 상세 조회 요청 - logSq: {}", logSq);
		
		AdminAuditDetailResponseDTO detail = adminAuditService.getAuditLogDetail(logSq);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "활동 로그 상세 조회 성공", detail));
	}
			

}
