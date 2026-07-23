package com.example.demo.domain.project.service.matching.criterion;

import org.springframework.stereotype.Component;

import com.example.demo.domain.project.entity.enums.EducationLevel;
import com.example.demo.domain.project.service.matching.MatchCriterion;
import com.example.demo.domain.project.vo.MatchContextVo;

@Component
public class EducationMatchCriterion implements MatchCriterion {

    @Override
    public String getCriterionCd() { return "EDUCATION"; }

    @Override
    public boolean isApplicable(MatchContextVo context, Long candidateProjectSq) {
        Long requiredCd = context.getProjectInfo(candidateProjectSq).getProjectRequiredEducationCd();
        return requiredCd != null && !requiredCd.equals(EducationLevel.ANY.getCodeSq());
    }

    @Override
    public int calculateScore(MatchContextVo context, Long candidateProjectSq) {
        Long requiredCd = context.getProjectInfo(candidateProjectSq).getProjectRequiredEducationCd();
        Long myCd = context.getSubject().getRequiredEducationCd();
        if (myCd == null) return 0;

        int requiredRank = EducationLevel.fromCode(requiredCd).getRank();
        int myRank = EducationLevel.fromCode(myCd).getRank();
        return myRank >= requiredRank ? 100 : 0;
    }
}