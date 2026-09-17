package com.example.demo.domain.scout.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ScoutStatusUpdateRequestDto {
	private String status;
	
	@JsonProperty("reject_reason")
	private String rejectReason;
	

}
