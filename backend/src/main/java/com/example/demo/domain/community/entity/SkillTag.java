package com.example.demo.domain.community.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillTag {
    private Long boardSkillTagSq;
    private Long boardSq;
    private Long answerSq;
    private Long skillTagSq;
    private String skillTagNm;
    private Long skillTagTypeCd;        // 1801 QnA / 1802 Answer
}
