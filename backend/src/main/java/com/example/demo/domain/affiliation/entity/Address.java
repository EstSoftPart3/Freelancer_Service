package com.example.demo.domain.affiliation.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.math.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    private Long addressSq;
    private String zonecode;
    private String address;
    private String detailAddress;
    private String sigungu;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime address_created_at_dtm;
    private Long area_code_sq;
}
