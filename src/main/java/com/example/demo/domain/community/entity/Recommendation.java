package com.example.demo.domain.community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recommendationSq;
    private Long userSq;
    private Long boardSq;
    private Long answerSq;
    private Long commentSq;
    private Long recommendationTypeCd;
}
