package com.example.demo.domain.user.dto;

import lombok.Data;

@Data
public class AccountLinkInfoDTO {
	private Boolean isLinked;
	private String email;
	private String provider;
}
