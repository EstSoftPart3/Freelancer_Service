package com.example.demo.domain.map.dto;

import lombok.*;
import java.math.BigDecimal;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapProjectDto {
    
    private Long projectSq;
    private String projectTitle;
    private String companyName;
    private String jobType;
    private String address;
    private String detailAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long projectSalary;
    private String projectStartDate;
    private String projectEndDate;
    private String sigungu;             // 시군구 정보
}
