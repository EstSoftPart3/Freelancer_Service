package com.example.demo.domain.project.service.matching.criterion;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.example.demo.domain.project.service.matching.MatchCriterion;
import com.example.demo.domain.project.vo.MatchContextVo;

@Component
public class SkillMatchCriterion implements MatchCriterion {

    @Override
    public String getCriterionCd() { return "SKILL"; }

    @Override
    public boolean isApplicable(MatchContextVo context, Long candidateProjectSq) { return true; }

    @Override
    public int calculateScore(MatchContextVo context, Long candidateProjectSq) {
        Set<String> mySkills = context.getSubject().getSkillTagNmSet();
        List<String> requiredSkills = context.getRequiredSkillNames(candidateProjectSq);

        long matched = requiredSkills.stream().filter(mySkills::contains).count();

        return requiredSkills.isEmpty()
                ? 100
                : (int) Math.round((double) matched / requiredSkills.size() * 100);
    }

    public boolean isEssentialFulfilled(MatchContextVo context, Long candidateProjectSq) {

        Set<String> mySkills = context.getSubject().getSkillTagNmSet();

        List<String> requiredSkills = context.getRequiredSkillNames(candidateProjectSq);

        return requiredSkills.stream().allMatch(mySkills::contains);
    }
}
