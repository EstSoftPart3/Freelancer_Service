package com.example.demo.domain.mypage.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectScrapAddressDTO {
    private String parentSigungu;
    private String sigungu;
}
