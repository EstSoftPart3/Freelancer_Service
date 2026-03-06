package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.admin.dto.AdminUsersListDTO;
import com.example.demo.domain.admin.dto.request.AdminUsersUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminUsersListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminUsersMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUsersService {
	private final AdminUsersMapper adminUsersMapper;
	private final PasswordEncoder passwordEncoder;
	private final FileStorageService fileStorageService;
	
	@Value("${admin.master-password}")
	private String masterPassword;
	
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
	
	@Transactional
	public void updateUser(Long userSq, AdminUsersUpdateRequestDTO dto) {
		
		// 1. 비밀번호 인코딩 (입력된  경우에만 !!!)
		String encodePw = null;
		if(dto.getUserPw() != null && !dto.getUserPw().isBlank()) {
			encodePw = passwordEncoder.encode(dto.getUserPw());
		}
		
		// 2. 기본정보 UPDATE
		adminUsersMapper.updateUser(userSq, dto, encodePw);
		
		// 3. 프로필 이미지 UPDATE (파일이 전송된 경우에만!!)
		if(dto.getProfileImage() != null && !dto.getProfileImage().isEmpty()) {
			Long fileSq = adminUsersMapper.findFileSqByUserSq(userSq);
			UploadedFileDTO uploaded = fileStorageService.uploadFile(dto.getProfileImage());
			
			if(fileSq != null) {
				// 파일이 있을 경우 교체
				String oldSaveNm = adminUsersMapper.findFileSaveNmByFileSq(fileSq);
				adminUsersMapper.updateFileSaveNm(fileSq, uploaded.getSavedName());
				fileStorageService.deleteFile(oldSaveNm);
			} else {
				// 파일이 없을 때 신규 등록
				adminUsersMapper.insertFile(uploaded);
				Long newFileSq = adminUsersMapper.findFileSqBySavedNm(uploaded.getSavedName());
				adminUsersMapper.insertUserProfileImage(userSq, newFileSq);
			}
		}
		
		// 4. 회사명 UPDATE (값이 있는 경우에만 !!)
		if(dto.getCompanyNm() != null && !dto.getCompanyNm().isBlank()) {
			adminUsersMapper.updateCompanyNm(userSq, dto.getCompanyNm());
		}
	}
	
	public void verifyMasterPassword(String password) {
		if(!masterPassword.equals(password)) {
			throw new IllegalArgumentException("마스터 패스워드가 일치하지 않습니다.");
		}
	}
}
