package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.request.AdminCompanyCreateRequestDTO;
import com.example.demo.domain.admin.dto.request.AdminCompanyUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminCompanyResponseDTO;
import com.example.demo.domain.admin.service.AdminCompanyService;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/affiliation")
@RequiredArgsConstructor
public class AdminCompanyController {
	
	private final AdminCompanyService adminCompanyService;
	
	// GET   /api/admin/affiliation/company
	@GetMapping("/company")
	public ResponseEntity<ApiResponse<?>> getCompanies() {
		List<AdminCompanyResponseDTO> companies = adminCompanyService.getCompanies();
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "회사 목록 조회 성공", companies)
		);
	}
	
	// Post   /api/admin/affiliation/company - 회사등록 
//	@PostMapping("/company")
//	public ResponseEntity<ApiResponse<?>> createCompany(
//			@RequestBody AdminCompanyCreateRequestDTO request) {
//		adminCompanyService.AdminCreateCompany(request);
//		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회사 등록 성공", null));
//	}
	
	// Create
	/*
	 * transactiono 순서
	 * 1. TBL_ADDRESS_S 에 먼저  INSERT
	 *     생성된 address_sq를 받아와서
	 *     
	 * 2. TBL_COMPANY_S에 INSERT
 	*      1번에서 받아온 address_sq를 여기 넣음   ==> 두 개를 하나의 @Transactional
	 */
	
	@PostMapping("/company")
	public ResponseEntity<ApiResponse<?>> createCompany(
			@RequestBody AdminCompanyCreateRequestDTO request) {
		// JwtAuthenticationFilter가 이미 토큰 팟깅해서 
		// SecurityContextHolder에 저장해둠
		// getPrincipal()이 userSq를 반환(JwtAuthenticationToken 코드 참고)
		Long userSq = (Long) SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getPrincipal();
		
		// 프론트에서 받은 DTO에 userSq 셋팅
		// 이 시점에 DTO 상태: 기업정보 0, 주소정보 0, userSq 0, addressSq X(아직 비어있음)
		request.setUserSq(userSq);
		
		// Service 호출 -> 주소 Insert -> addresSq 자동 셋팅- > 기업 insert
		adminCompanyService.AdminCreateCompany(request);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회사 등록 성공", null));
	}
	
	
	// Update (1)
	// GET - /api/admin/affiliation/company/{companySq} -> 수정 폼에 기존데이터 보여주기
	@GetMapping("/company/{companySq}")
	public ResponseEntity<ApiResponse<?>> getCompanyDetail(
			@PathVariable Long companySq) {
		AdminCompanyResponseDTO company = adminCompanyService.getCompanyDetail(companySq);
		
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "기업 상세 조회 성공", company));
	};
	
	// PUT - /api/admin/affiliation/company/{companySq} -> 수정된 데이터 저장하기
	@PutMapping("/company/{companySq}")
	public ResponseEntity<ApiResponse<?>> adminUpdateCompany(
			@PathVariable Long companySq,
			@RequestBody AdminCompanyUpdateRequestDTO request) {
		adminCompanyService.adminUpdateCompany(companySq, request);
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "기업 수정 성공", null));		
	}
	
	
	
	// Delete
	@DeleteMapping("/company/{companySq}")
	public ResponseEntity<ApiResponse<?>> adminDeleteCompany(
			@PathVariable Long companySq) {
		adminCompanyService.adminDeleteCompany(companySq);
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "관리자 회사 삭제 성공", null));
	}
}
