package com.example.demo.domain.scout.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScoutRequestDto {
	@JsonProperty("freelancer_sq")
    private Long freelancerSq;

    @JsonProperty("project_sq")
    private Long projectSq;

    private String title;
    private String content;

    @JsonProperty("offered_pay")
    private Long offeredPay;

}
