package com.example.demo.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AuditLogEventDTO {
	
	private String userTypeCd;
	private String userNm;
	private String actionType;
	private String targetType;
	private String targetTitle;
	private String ipAddress;
	private String beforeDataTxt;
	private String afterDataTxt;
	

}
