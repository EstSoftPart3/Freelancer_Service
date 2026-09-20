package com.example.demo.domain.scout.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutDetailResponse {
	
	@JsonProperty("scouts_sq")
    private Long scoutsSq;

    @JsonProperty("company_sq")
    private Long companySq;

    @JsonProperty("sender_company_name")
    private String senderCompanyName;

    @JsonProperty("project_sq")
    private Long projectSq;

    @JsonProperty("project_title")
    private String projectTitle;

    private String title;
    private String content;

    @JsonProperty("offered_pay")
    private Long offeredPay;

    private String status;

    @JsonProperty("created_at")
    private String createdAt;
    
    private String updatedAt;

}
