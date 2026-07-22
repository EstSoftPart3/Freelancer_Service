package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.domain.project.vo.MatchContextVo;
import com.example.demo.domain.project.vo.MatchResultVo;
import com.example.demo.domain.project.vo.ProjectRecommendationVo;
import com.example.demo.domain.project.vo.ProjectSummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRecommandationResponse {

    private Long projectSq;
    private String projectTtl;
    private Integer matchScore;
    private String companyNm;
    private String addressNm;
    private Long projectSalary;
    private List<String> requiredSkillList;

    private ProjectRecommandationResponse toResponse(MatchContextVo context, MatchResultVo result) {
        ProjectRecommendationVo vo = context.getProjectInfo(result.getProjectSq());

        return ProjectRecommandationResponse.builder()
                .projectSq(vo.getProjectSq())
                .projectTtl(vo.getProjectTtl())
                .matchScore((int) Math.round(result.getTotalScore()))
                .companyNm(vo.getCompanyNm())
                .addressNm(vo.getAddressNm())
                .projectSalary(vo.getProjectSalary())
                .requiredSkillList(context.getRequiredSkillNames(result.getProjectSq()))
                .build();
    }
    
}
