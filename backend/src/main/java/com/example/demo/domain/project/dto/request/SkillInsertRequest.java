package com.example.demo.domain.project.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SkillInsertRequest {
    private Long skillTagSq;
    private Long parentSkillTagSq;
    private Integer skillTagLvl;
    private String skillTagNm;

    public SkillInsertRequest(String skillTagNm) {
        this.skillTagNm = skillTagNm;
    }
}