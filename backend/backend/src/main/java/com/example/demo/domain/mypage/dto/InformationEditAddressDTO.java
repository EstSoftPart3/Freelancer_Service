package com.example.demo.domain.mypage.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InformationEditAddressDTO {
    private Long addressSq;
    private String zonecode;
    private String address;
    private String detailAddress;
    private String sigungu;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long areaCodeSq;
}
