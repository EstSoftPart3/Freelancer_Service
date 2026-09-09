package com.example.demo.domain.affiliation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Scrap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scrapSq;
    private Long userSq;
    private Long companySq;
    private Long projectSq;
    private Long scrapTypeCd;

}
