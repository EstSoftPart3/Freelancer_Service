package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.dto.AdminUsersListDTO;
import com.example.demo.domain.admin.dto.response.AdminUsersListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminUsersMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUsersService {
	private final AdminUsersMapper adminUsersMapper;
	
	@Transactional(readOnly = true)
	public AdminUsersListResponseDTO getAdminUsers(List<Long> typeCds, String keyword, String tagKeyword,
			String sortField, String sortOrder, Long page, Long size) {
		
		// 1. 페이징 시작점(Offset) 계산
		Long offset = (page - 1) * size;
		
		// 2. Admin 전용 DTO 리스트 조회
		List<AdminUsersListDTO> users = adminUsersMapper.findAllUsers(
				typeCds, keyword, tagKeyword, sortField, sortOrder, offset, size);
		
		// 3. 전체 개수 조회
		Long totalElements = adminUsersMapper.findAllUsersCnt(typeCds, keyword, tagKeyword);
		
		// 4. Admin 전용 응답 DTO 조립
		return AdminUsersListResponseDTO.builder()
				.users(users)
				.totalElements(totalElements)
				.page(page)
				.size(size)
				.build();
	}
}
