package com.example.demo.domain.project.service.matching.criterion;

import com.example.demo.domain.project.entity.enums.DeveloperGrade;
import com.example.demo.domain.project.service.matching.MatchCriterion;
import com.example.demo.domain.project.vo.MatchContextVo;

public class CareerMatchCriterion implements MatchCriterion {

    @Override
    public String getCriterionCd() { return "CAREER"; }

    @Override
    public boolean isApplicable(MatchContextVo context, Long candidateProjectSq) {
        return context.getSubject().getDeveloperGradeCd() != null
                && context.getProjectInfo(candidateProjectSq).getProjectDeveloperGradeCd() != null;
    }

    @Override
    public int calculateScore(MatchContextVo context, Long candidateProjectSq) {
        DeveloperGrade mine = DeveloperGrade.fromCode(context.getSubject().getDeveloperGradeCd());
        DeveloperGrade required = DeveloperGrade.fromCode(
                context.getProjectInfo(candidateProjectSq).getProjectDeveloperGradeCd());

        int distance = Math.abs(mine.ordinal() - required.ordinal());
        return Math.max(100 - distance * 12, 0);
    }
}
