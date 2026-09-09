package com.example.demo.domain.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GoogleLoginResponseDTO {

    @JsonProperty("user_sq")
    private Long userSq;

    @JsonProperty("email")
    private String email;

    @JsonProperty("user_nm")
    private String userNm;

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("is_new_user_yn")
    private String isNewUserYn; // 최초가입 "Y", 재로그인 "N"

}
