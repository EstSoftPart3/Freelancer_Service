package com.example.demo.domain.admin.dto.request;

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
public class AdminAuditListRequestDTO {
	private String startDate;
	private String endDate;
	private String userType;
	private String actionType;
	private String targetType;
	private String keyword;
	private Long page;
	private Long size;
	
	
	private Long offset;
}
