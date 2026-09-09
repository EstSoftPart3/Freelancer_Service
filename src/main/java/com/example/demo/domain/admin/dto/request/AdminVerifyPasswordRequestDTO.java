package com.example.demo.domain.admin.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminVerifyPasswordRequestDTO {
	private String masterPassword;
}
