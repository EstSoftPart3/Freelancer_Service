package com.example.demo.domain.user.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserSocialDTO {
	private Long socialSq;
	private Long userSq;
	private String socialProviderCd;
	private String socialId;
	private String socialEmail;
	private String socialRefreshToken;
	private LocalDateTime socialTokenExpiredAtDtm;
	private LocalDateTime socialCreatedAtDtm;
	private LocalDateTime socialModifiedAtDtm;
}
