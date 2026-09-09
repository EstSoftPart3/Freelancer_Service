package com.example.demo.domain.project.dto;

import java.util.List;

import lombok.Data;

@Data
public class CorporateApplicantGroupDTO {
    private String companyNm;
    private List<PersonalApplicantDTO> applicants;
}
