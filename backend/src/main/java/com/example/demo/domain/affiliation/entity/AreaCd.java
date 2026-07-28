package com.example.demo.domain.affiliation.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AreaCd {
    private Long areaCodeSq;
    private String areaSigungu;
    private Long parentAreaCodeSq;
}
