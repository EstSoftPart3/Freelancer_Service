package com.example.demo.domain.project.service.matching;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "matching.weight")
@Getter @Setter
public class MatchWeightConfig {
    private int skill;
    private int career;
    private int education;
    private int certificate;

    public int getWeight(String criterionCd) {
        return switch (criterionCd) {
            case "SKILL" -> skill;
            case "CAREER" -> career;
            case "EDUCATION" -> education;
            case "CERTIFICATE" -> certificate;
            default -> 0;
        };
    }
}
