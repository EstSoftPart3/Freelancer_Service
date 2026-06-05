package com.example.demo.domain.admin.dto;

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
public class AdminAuditListDTO {
	private Long logSq;
	private String createdAt;
	private String userTypeCd;
	private String userNm;
	private String actionType;
	private String targetType;
	private String targetTitle;
	private String ipAddress;
	private Object beforeData;
	private Object afterData;
}
