package com.example.demo.domain.admin.dto.response;

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
public class AdminAuditDetailResponseDTO {
	private Long logSq;
	private String actionType;
	private String userTypeCd;
	private String targetType;
	private String targetTitle;
	private String userNm;
	private String createdAt;
	private String ipAddress;
	
	private Object beforeData;
	private Object afterData;
}
