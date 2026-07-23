package com.example.demo.domain.project.vo;

import lombok.Getter;

@Getter
public class MatchResultVo {
    private final Long projectSq;
    private final double totalScore;
    private final boolean essentialFulfilled;

    public MatchResultVo(Long projectSq, double totalScore, boolean essentialFulfilled) {
        this.projectSq = projectSq;
        this.totalScore = totalScore;
        this.essentialFulfilled = essentialFulfilled;
    }
}
