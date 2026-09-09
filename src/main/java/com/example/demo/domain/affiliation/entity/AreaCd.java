package com.example.demo.domain.affiliation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AreaCd {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long areaCodeSq;
    private String areaSigungu;
    private Long parentAreaCodeSq;
}
