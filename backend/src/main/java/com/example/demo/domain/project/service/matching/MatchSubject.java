package com.example.demo.domain.project.service.matching;

import java.util.Set;

public interface MatchSubject {
    Set<String> getSkillTagNmSet();
    Long getDeveloperGradeCd();
    Long getRequiredEducationCd();
    String getPreferenceTxt();
}
