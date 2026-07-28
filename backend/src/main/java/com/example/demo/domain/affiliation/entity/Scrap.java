package com.example.demo.domain.affiliation.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Scrap {
    private Long scrapSq;
    private Long userSq;
    private Long companySq;
    private Long projectSq;
    private Long scrapTypeCd;

}
