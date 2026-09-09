package com.example.demo.domain.affiliation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumeSkillTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resumeSkillSq;
    private Long resumeSq;
    private Long skillTagSq;
    private Long parentSkillTagSq;
    private Integer skillTagLvl;
    private String skillTagNm;

}
