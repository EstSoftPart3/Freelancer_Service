package com.example.demo.domain.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleLoginRequestDTO {

    @JsonProperty("auth_code")
    private String authCode;

    @JsonProperty("redirect_uri")
    private String redirectUri;
}
