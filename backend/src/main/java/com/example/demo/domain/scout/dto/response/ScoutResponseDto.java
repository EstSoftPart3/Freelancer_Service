package com.example.demo.domain.scout.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ScoutResponseDto {
	
	@JsonProperty("scout_sq")
    private Long scoutSq;

    private String status; // PENDING, ACCEPTED, REJECTED, EXPIRED

    @JsonProperty("created_at")
    private String createdAt;

}
