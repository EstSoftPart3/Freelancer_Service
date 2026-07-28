package com.example.demo.domain.affiliation.entity;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Career {
    private Long careerSq;
    private LocalDate careerStartDt;
    private LocalDate careerEndDt;
    
}
