package com.example.demo.domain.project.service.matching;

import com.example.demo.domain.project.vo.MatchContextVo;

public interface MatchCriterion {
	
    String getCriterionCd();
    boolean isApplicable(MatchContextVo context, Long candidateProjectSq);
    int calculateScore(MatchContextVo context, Long candidateProjectSq);
	
}
