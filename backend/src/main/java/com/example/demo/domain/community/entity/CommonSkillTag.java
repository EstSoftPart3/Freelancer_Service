package com.example.demo.domain.community.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommonSkillTag {
    private Long skillTagSq;
    private Long parentSkillTagSq;
    private Integer skillTagLvl;
    private String skillTagNm;
}
