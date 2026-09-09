package com.example.demo.domain.community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommonSkillTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long skillTagSq;
    private Long parentSkillTagSq;
    private Integer skillTagLvl;
    private String skillTagNm;
}
