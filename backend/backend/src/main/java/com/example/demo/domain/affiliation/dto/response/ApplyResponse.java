package com.example.demo.domain.affiliation.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyResponse{
	private ApplicationResponse apply;
	private AffiliationResponse affiliation;
    
}