package com.example.demo.domain.project.service.matching.criterion;

import java.util.Arrays;

import com.example.demo.domain.project.service.matching.MatchCriterion;
import com.example.demo.domain.project.vo.MatchContextVo;

public class CertificateMatchCriterion implements MatchCriterion {

    @Override
    public String getCriterionCd() { return "CERTIFICATE"; }

    @Override
    public boolean isApplicable(MatchContextVo context, Long candidateProjectSq) {
        String txt = context.getProjectInfo(candidateProjectSq).getProjectPreferenceTxt();
        return txt != null && !txt.isBlank();
    }

    @Override
    public int calculateScore(MatchContextVo context, Long candidateProjectSq) {
        String txt = context.getProjectInfo(candidateProjectSq).getProjectPreferenceTxt();
        String myTxt = context.getSubject().getPreferenceTxt();
        if (myTxt == null || myTxt.isBlank()) return 0;

        boolean anyMatch = Arrays.stream(myTxt.split(" "))
                .anyMatch(name -> !name.isBlank() && txt.contains(name));
        return anyMatch ? 100 : 0;
    }
}
