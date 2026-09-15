package com.example.demo.domain.salary.dto.response;

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
public class CompanyRecommendationDTO {
    private String companyNm;
    private Integer matchedCount;
    private Integer avgSalary;
}
