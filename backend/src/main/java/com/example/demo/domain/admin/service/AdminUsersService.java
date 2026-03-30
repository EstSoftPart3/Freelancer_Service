package com.example.demo.domain.admin.service;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.domain.admin.dto.request.AdminUsersCreateCompanyAddressRequestDTO;
import com.example.demo.domain.admin.dto.request.AdminUsersCreateCompanyRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminUsersCreateCompanyResponseDTO;
import com.example.demo.domain.admin.dto.request.AdminUsersUpdateCompanyRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminUsersCompanyListResponseDTO;
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
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminUsersService {
	private final AdminUsersMapper adminUsersMapper;
	private final PasswordEncoder passwordEncoder;
	private final FileStorageService fileStorageService;
	
	@Value("${admin.master-password}")
	private String masterPassword;

    @Transactional(readOnly = true)
    public AdminUsersListResponseDTO getAdminUsers(List<Long> typeCds, List<Long> companySqs, List<Long> userGenderCds,
            String keyword, String tagKeyword, String sortField, String sortOrder, Long page, Long size) {

        // 1. 페이징 시작점(Offset) 계산
        Long offset = (page - 1) * size;

        // 2. Admin 전용 DTO 리스트 조회
        List<AdminUsersListDTO> users = adminUsersMapper.findAllUsers(
                typeCds, companySqs, userGenderCds, keyword, tagKeyword, sortField, sortOrder, offset, size);

        // 3. 전체 개수 조회
        Long totalElements = adminUsersMapper.findAllUsersCnt(typeCds, companySqs, userGenderCds, keyword, tagKeyword);

        // 4. Admin 전용 응답 DTO 조립
        return AdminUsersListResponseDTO.builder()
				.users(users)
				.totalElements(totalElements)
				.page(page)
				.size(size)
				.build();
	}

    @Transactional
    public List<AdminUsersCompanyListResponseDTO> getCompanies(String keyword) {
        return adminUsersMapper.findAllCompanies(keyword);
    }
    @Transactional
    public List<AdminUsersCompanyListResponseDTO> getCompany(Long CompanySq) {
        return adminUsersMapper.findCompany(CompanySq);
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

        // 4. 소속 처리
        String action = dto.getAffiliationAction();
        if (action == null) action = "NONE";

        switch (action) {
            case "JOIN":
                // 시나리오 1: 일반 무소속 또는 기업 무소속 → 새 소속 JOIN
                if (dto.getCompanySq() != null) {
                    adminUsersMapper.insertCompanyMember(userSq, dto.getCompanySq());
                }
                break;

            case "LEAVE":
                // 시나리오 2a: 일반 소속 있음 → 소속 삭제(LEAVE)
                adminUsersMapper.updateCompanyMemberLeave(userSq);
                break;

            case "CHANGE":
                // 시나리오 2b: 일반 소속 있음 → 다른 소속으로 변경
                adminUsersMapper.updateCompanyMemberLeave(userSq);
                if (dto.getCompanySq() != null) {
                    adminUsersMapper.insertCompanyMember(userSq, dto.getCompanySq());
                }
                break;

            case "NONE":
            default:
                // 시나리오 4: 소속 변경 없음 → 아무 처리 안 함
                break;
        }
    }

    @Transactional
    public void updateCompany(Long companySq, AdminUsersUpdateCompanyRequestDTO dto) {
        adminUsersMapper.updateCompany(companySq, dto);
    }

    @Transactional
    public AdminUsersCreateCompanyResponseDTO createCompany(AdminUsersCreateCompanyRequestDTO dto) {
        Long addressSq = null;

        if (StringUtils.hasText(dto.getCompanyAddress())
                || StringUtils.hasText(dto.getCompanyDetailAddress())) {
            AdminUsersCreateCompanyAddressRequestDTO addressDto = AdminUsersCreateCompanyAddressRequestDTO
                    .builder()
                    .zonecode(dto.getCompanyZonecode())
                    .address(dto.getCompanyAddress())
                    .detailAddress(dto.getCompanyDetailAddress())
                    .sigungu(dto.getCompanySigungu())
                    .latitude(dto.getCompanyLatitude() != null ? dto.getCompanyLatitude() : BigDecimal.ZERO)
                    .longitude(dto.getCompanyLongitude() != null ? dto.getCompanyLongitude() : BigDecimal.ZERO)
                    .build();
            adminUsersMapper.insertCompanyAddress(addressDto);
            addressSq = addressDto.getAddressSq();
        }

        dto.setAddressSq(addressSq);
        adminUsersMapper.insertCompany(dto);

        return AdminUsersCreateCompanyResponseDTO.builder()
                .companySq(dto.getCompanySq())
                .build();
    }

	public void verifyMasterPassword(String password) {
		if(!masterPassword.equals(password)) {
			throw new IllegalArgumentException("마스터 패스워드가 일치하지 않습니다.");
		}
	}
}
