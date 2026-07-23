package com.example.demo.domain.project.service.matching;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.project.service.matching.criterion.SkillMatchCriterion;
import com.example.demo.domain.project.vo.MatchContextVo;
import com.example.demo.domain.project.vo.MatchResultVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchScoreAggregator {

    private final List<MatchCriterion> criterionList; // Spring이 @Component 전부 자동 주입
    private final MatchWeightConfig weightConfig;
    private final SkillMatchCriterion skillMatchCriterion; // 필수충족 여부 별도 판정용

    public List<MatchResultVo> calculateAll(MatchContextVo context) {
    	
        List<MatchResultVo> results = new ArrayList<>();
        
        for (Long candidateProjectSq : context.getAllCandidateProjectSq()) {
        	
            List<MatchCriterion> applicable = criterionList.stream()
                    .filter(c -> c.isApplicable(context, candidateProjectSq))
                    .toList();

            int totalWeight = applicable.stream()
                    .mapToInt(c -> weightConfig.getWeight(c.getCriterionCd()))
                    .sum();

            double totalScore = 0;
            if (totalWeight > 0) {
                for (MatchCriterion criterion : applicable) {
                    int rawScore = criterion.calculateScore(context, candidateProjectSq);
                    double adjustedWeight = weightConfig.getWeight(criterion.getCriterionCd()) * 100.0 / totalWeight;
                    totalScore += rawScore * adjustedWeight / 100.0;
                }
            }

            boolean essentialFulfilled = skillMatchCriterion.isEssentialFulfilled(context, candidateProjectSq);

            results.add(new MatchResultVo(candidateProjectSq, totalScore, essentialFulfilled));
            
        }

        return results;
    }
}
