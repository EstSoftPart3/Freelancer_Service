package com.example.demo.domain.company.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public class CompanyStatusRequest {
	private Long userSq;
	private String newStatus;
}
