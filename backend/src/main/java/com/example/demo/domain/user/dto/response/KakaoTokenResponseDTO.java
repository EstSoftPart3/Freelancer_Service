package com.example.demo.domain.user.dto.response;

import lombok.Data;

@Data
public class KakaoTokenResponseDTO {
	private String access_token;
	private String token_type;
	private String refresh_token;
	private Integer expires_in;
}
