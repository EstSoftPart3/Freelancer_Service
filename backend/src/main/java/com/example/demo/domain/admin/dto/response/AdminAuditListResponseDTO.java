package com.example.demo.domain.admin.dto.response;

import java.util.List;
import com.example.demo.domain.admin.dto.AdminAuditListDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuditListResponseDTO {
	private Long totalElements;
	private Long totalPages;
	private List<AdminAuditListDTO> content;
}
