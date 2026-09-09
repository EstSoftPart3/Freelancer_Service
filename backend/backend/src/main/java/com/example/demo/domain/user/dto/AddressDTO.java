package com.example.demo.domain.user.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class AddressDTO {
    private Long addressSq;
    private String zonecode;
    private String address;
    private String detailAddress;
    private String sigungu;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long areaCodeSq;
}
