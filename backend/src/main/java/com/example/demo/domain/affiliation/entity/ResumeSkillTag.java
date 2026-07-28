package com.example.demo.domain.affiliation.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumeSkillTag {
    private Long resumeSkillSq;
    private Long resumeSq;
    private Long skillTagSq;
    private Long parentSkillTagSq;
    private Integer skillTagLvl;
    private String skillTagNm;

}
