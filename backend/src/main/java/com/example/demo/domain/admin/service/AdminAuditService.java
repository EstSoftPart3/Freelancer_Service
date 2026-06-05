package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.dto.AdminAuditListDTO;
import com.example.demo.domain.admin.dto.request.AdminAuditListRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminAuditDetailResponseDTO;
import com.example.demo.domain.admin.dto.response.AdminAuditListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminAuditMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditService {
	
	private final AdminAuditMapper adminAuditMapper;
	private final ObjectMapper objectMapper;
	
	@Transactional(readOnly = true)
	public AdminAuditListResponseDTO getAuditLogs(AdminAuditListRequestDTO requestDTO) {
		
		long currentPage = (requestDTO.getPage() != null) ? requestDTO.getPage() : 1L;
		long pageSize = (requestDTO.getSize() != null) ? requestDTO.getSize() : 10L;
		
		long offset = (currentPage - 1) * pageSize;
		requestDTO.setOffset(offset);
		requestDTO.setSize(pageSize);
		
		List<AdminAuditListDTO> logs = adminAuditMapper.findAuditLogs(requestDTO);
		
		for (AdminAuditListDTO logDto:logs) {
			try {
				if (logDto.getBeforeData() != null) {
					logDto.setBeforeData(objectMapper.readTree(logDto.getBeforeData().toString()));
				}
				if (logDto.getAfterData() != null) {
					logDto.setAfterData(objectMapper.readTree(logDto.getAfterData().toString()));
				} 
			} catch (Exception e) {}
			
		}
		
		Long totalElements = adminAuditMapper.countAuditLogs(requestDTO);
		
		Long totalPages = (totalElements ==0 ) ? 1: (long) Math.ceil((double) totalElements / pageSize);
		
		return AdminAuditListResponseDTO.builder()
				.totalElements(totalElements)
				.totalPages(totalPages)
				.content(logs)
				.build();
	}
	
	@Transactional(readOnly = true)
	public AdminAuditDetailResponseDTO getAuditLogDetail(Long logSq) {
		
		AdminAuditDetailResponseDTO detail = adminAuditMapper.findAuditLogDetail(logSq);
		
		if (detail == null) {
			throw new RuntimeException("해당 로그를  찾을 수 없습니다.");
		}
		
		try {
			if (detail.getBeforeData() != null) {
				detail.setBeforeData(objectMapper.readTree(detail.getBeforeData().toString()));
			}
			if (detail.getAfterData() != null) {
				detail.setAfterData(objectMapper.readTree(detail.getAfterData().toString()));
			}
		} catch (Exception e) {
			log.warn("JSON 파싱 에러 발생 - 일반 텍스트(댓글 등)일 수 있으므로 파싱 생략: {}", e.getMessage());
		}
		
		return detail;
	}
}
