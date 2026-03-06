package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.request.AdminUsersUpdateRequestDTO;
import com.example.demo.domain.admin.dto.request.AdminVerifyPasswordRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminUsersListResponseDTO;
import com.example.demo.domain.admin.service.AdminUsersService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUsersController {
	private final AdminUsersService adminUsersService;
	
	@GetMapping
	public ResponseEntity<ApiResponse<AdminUsersListResponseDTO>> getUsers(
            @RequestParam(value = "typeCds", required = false) List<Long> typeCds,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "tagKeyword", required = false) String tagKeyword,
            @RequestParam(value = "sortField", defaultValue = "createdAt") String sortField,
            @RequestParam(value = "sortOrder", defaultValue = "DESC") String sortOrder,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size
			) {
		
		log.info("유저 목록 page: {}, typeCds: {}, keyword: {}", page, typeCds, keyword);
			
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "유저 목록 조회 성공",
				adminUsersService.getAdminUsers(typeCds, keyword, tagKeyword, sortField, sortOrder, page, size)));
	};
	
	@PatchMapping("/{userSq}")
	public ResponseEntity<ApiResponse<Void>> updateUser(
			@PathVariable Long userSq,
			@ModelAttribute AdminUsersUpdateRequestDTO dto
			) {
		
		adminUsersService.updateUser(userSq, dto);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "유저 수정 성공", null));
	}
	
	@PostMapping("/verify-password")
	public ResponseEntity<ApiResponse<Void>> verifyPassword(
	        @RequestBody AdminVerifyPasswordRequestDTO dto) {

	    adminUsersService.verifyMasterPassword(dto.getMasterPassword());
	    return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "마스터 패스워드 검증 완료", null));
	}
}
