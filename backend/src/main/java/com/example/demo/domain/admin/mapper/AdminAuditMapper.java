package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminAuditListDTO;
import com.example.demo.domain.admin.dto.AuditLogEventDTO;
import com.example.demo.domain.admin.dto.request.AdminAuditListRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminAuditDetailResponseDTO;

@Mapper
public interface AdminAuditMapper {
	List<AdminAuditListDTO> findAuditLogs(AdminAuditListRequestDTO requestDTO);
	
	Long countAuditLogs(AdminAuditListRequestDTO requestDTO);
	
	AdminAuditDetailResponseDTO findAuditLogDetail(@Param("logSq") Long logSq);
	
	void insertAuditLog(AuditLogEventDTO eventDto);
}
