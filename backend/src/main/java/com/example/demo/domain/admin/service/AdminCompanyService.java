package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.dto.request.AdminCompanyCreateRequestDTO;
import com.example.demo.domain.admin.dto.request.AdminCompanyUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminCompanyResponseDTO;
import com.example.demo.domain.admin.mapper.AdminCompanyMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCompanyService {
	
	private final AdminCompanyMapper adminCompanyMapper;
	
	public List<AdminCompanyResponseDTO> getCompanies() {
		log.info("회사 목록 조회 시작");
		List<AdminCompanyResponseDTO> result = adminCompanyMapper.selectCompanyAll();
		log.info("회사 목록 조회 완료 - 총 {}건", result.size());
		return result;
	}
	
//	@Transactional(readOnly = false)
//	public void AdminCreateCompany(AdminCompanyCreateRequestDTO request) {
//		log.info("관리자에서 회사를 등록합니다. - 기업명: {}", request.getCompanyNm());
//		adminCompanyMapper.adminInsertCompany(request);
//		log.info("관리자의 회사 등록이 완료하였습니다.");
//	}
	
	// Create
	/*
	 * transactiono 순서
	 * 1. TBL_ADDRESS_S 에 먼저  INSERT
	 *     생성된 address_sq를 받아와서
	 *     
	 * 2. TBL_COMPANY_S에 INSERT
	 *    1번에서 받아온 address_sq를 여기 넣음   ==> 두 개를 하나의 @Transactional
	 */
	
	@Transactional(readOnly = false)
	public void AdminCreateCompany(AdminCompanyCreateRequestDTO request) {
		log.info("기업 주소 등록 시작");
		
		// 1. 주소
		// 이 호출이 끝나는 순간 request.addressSq에 DB가 자동생성한 Pk로 채워지게 됨
		adminCompanyMapper.insertAddress(request);
		
		log.info("기업 주소 등록 완료 - addressSq: {}", request.getAddressSq());
		
		// 2. 기업 INsert
		// request 안에 이미 userSq(Controller에서 셋팅), addressSq(위에서 자동 셋팅)가 들어있음
		adminCompanyMapper.adminInsertCompany(request);
		
		log.info("기업 등록 완료");
	}
	
	// 삭제(물리삭제)
	@Transactional(readOnly = false)
	public void adminDeleteCompany(Long companySq) {
		log.info("관리자의 기업 삭제 시작 - companySq: {}", companySq);
		adminCompanyMapper.adminDeleteCompany(companySq);
		log.info("관리자의 기업 삭제 완료 - companySq: {}", companySq);
	}
	
	
	// 수정 - 1.상세조회
	public AdminCompanyResponseDTO getCompanyDetail(Long companySq) {
		log.info("기업 상세 조회 시작 - companySq: {}", companySq);
		AdminCompanyResponseDTO result = adminCompanyMapper.selectCompanyDetail(companySq);
		log.info("기업 상세 조회 완료 - companyNm: {}", result.getCompanyNm());
		return result;
	}
	// 수정 - 2. 수정
	@Transactional(readOnly = false)
	public void adminUpdateCompany(Long companySq, AdminCompanyUpdateRequestDTO request) {
		log.info("기업 수정 시작 - companySq: {}", companySq);
		
		// URL에서 받은 companySq를 DTO에 셋팅 
		// XML에서 #{companySq}로 where조건에 쓰기 위함 
		request.setCompanySq(companySq);
		
		adminCompanyMapper.adminUpdateCompany(request);
		log.info("기업 수정 완료 - companySq: {}", companySq);
	}
	
	

}
