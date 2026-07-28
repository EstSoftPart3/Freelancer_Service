package com.example.demo.domain.community.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Recommendation {
    private Long recommendationSq;
    private Long userSq;
    private Long boardSq;
    private Long answerSq;
    private Long commentSq;
    private Long recommendationTypeCd;
}
