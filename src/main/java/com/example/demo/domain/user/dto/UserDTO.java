package com.example.demo.domain.user.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	@JsonProperty("user_sq")
    private Long userSq;
	
    private Long addressSq;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("email")
    private String userEmail;
    private String userPw;
    
    @JsonProperty("user_nm")
    private String userNm;
    
    private Long userGenderCd;
    private String userPhoneNum;
    private LocalDate userBirthDt;
    private Long userTypeCd;
    private Long userSignupTypeCd;
    private String userIsDeletedYn;
    
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("is_new_user_yn")
    private String isNewUserYn;
}
