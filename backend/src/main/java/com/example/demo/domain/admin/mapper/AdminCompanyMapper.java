package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.admin.dto.request.AdminCompanyCreateRequestDTO;
import com.example.demo.domain.admin.dto.request.AdminCompanyUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminCompanyResponseDTO;import io.lettuce.core.dynamic.annotation.Param;

@Mapper
public interface AdminCompanyMapper {
	
	// 전체 회사 목록
	List<AdminCompanyResponseDTO> selectCompanyAll();
	
	// 나중에 페이징 검색어 필요할 때 여기 
//	List<AdminCompanyResponseDTO> selectCompanyBySearch(@Param("request) AdminCompanyRequestDTO request);
//	Long countCompanyAll();
	
	// 회사 주소 insert
	void insertAddress(AdminCompanyCreateRequestDTO request);
		
	// 회사등록 
	void adminInsertCompany(AdminCompanyCreateRequestDTO request);
	
	// delete
	void adminDeleteCompany(Long companySq);
	
	// Update
	
	// 1. 조회
	AdminCompanyResponseDTO selectCompanyDetail(Long companySq);
	// 2. 수정
	void adminUpdateCompany(AdminCompanyUpdateRequestDTO request);
	
	
	
}
