package com.example.demo.domain.admin.dto.request;

import java.math.BigDecimal;

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
public class AdminUsersCreateCompanyAddressRequestDTO {
    private Long addressSq;
    private String zonecode;
    private String address;
    private String detailAddress;
    private String sigungu;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
