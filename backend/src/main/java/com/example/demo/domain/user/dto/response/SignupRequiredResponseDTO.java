package com.example.demo.domain.user.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SignupRequiredResponseDTO {
	private Boolean isNewUser;
	private String tempToken;
}
