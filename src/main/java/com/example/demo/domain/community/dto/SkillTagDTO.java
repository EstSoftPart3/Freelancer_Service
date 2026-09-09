package com.example.demo.domain.community.dto;

import com.example.demo.domain.community.entity.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillTagDTO {
    private Long skillTagSq;
    private String skillTagNm;

    public static SkillTagDTO fromEntity(SkillTag skillTag) {
        return new SkillTagDTO(
			skillTag.getSkillTagSq(),
			skillTag.getSkillTagNm()
        );
    }
}
