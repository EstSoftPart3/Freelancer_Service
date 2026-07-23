package com.example.demo.domain.project.vo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.domain.project.service.matching.MatchSubject;
import com.example.demo.domain.project.util.ProjectUtil;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MatchContextVo {

    private MatchSubject subject;
    private Map<Long, ProjectRecommendationVo> projectMap;
    private Map<Long, List<String>> requiredSkillMap;

    public static MatchContextVo of(MatchSubject subject,
                                     List<ProjectRecommendationVo> candidates,
                                     ProjectUtil util) {

        Map<Long, ProjectRecommendationVo> projectMap = candidates.stream()
                .collect(Collectors.toMap(ProjectRecommendationVo::getProjectSq, p -> p));

        Map<Long, List<String>> requiredSkillMap = new HashMap<>();
        for (ProjectRecommendationVo vo : candidates) {
            requiredSkillMap.put(vo.getProjectSq(), util.fetchReqSkillsByProjectSq(vo.getProjectSq()));
        }

        return MatchContextVo.builder()
                .subject(subject)
                .projectMap(projectMap)
                .requiredSkillMap(requiredSkillMap)
                .build();
    }

    public ProjectRecommendationVo getProjectInfo(Long projectSq) {
        return projectMap.get(projectSq);
    }

    public List<String> getRequiredSkillNames(Long projectSq) {
        return requiredSkillMap.getOrDefault(projectSq, List.of());
    }

    public Set<Long> getAllCandidateProjectSq() {
        return projectMap.keySet();
    }
}
