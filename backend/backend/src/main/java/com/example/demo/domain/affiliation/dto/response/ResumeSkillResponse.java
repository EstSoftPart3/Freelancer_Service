package com.example.demo.domain.affiliation.dto.response;

import com.example.demo.domain.affiliation.entity.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSkillResponse {
    private Long skillTagSq;
    private String skillTagNm;

    public static ResumeSkillResponse fromEntity(ResumeSkillTag skillTag) {
        return new ResumeSkillResponse(
			skillTag.getSkillTagSq(),
			skillTag.getSkillTagNm()
        );
    }
}
