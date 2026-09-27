package com.example.demo.domain.scout.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CareerCalculator {
	
	public record ProjectPeriod(LocalDate startDate, LocalDate endDate) {}

    public static String calculateCareerGrade(List<ProjectPeriod> projects) {
        if (projects == null || projects.isEmpty()) {
            return "초초";
        }

        List<ProjectPeriod> validProjects = projects.stream()
                .filter(p -> p.startDate() != null && p.endDate() != null)
                .sorted(Comparator.comparing(ProjectPeriod::startDate))
                .toList();

        if (validProjects.isEmpty()) return "초초";

        // 중복 구간 병합
        List<ProjectPeriod> merged = new ArrayList<>();
        LocalDate curStart = validProjects.get(0).startDate();
        LocalDate curEnd = validProjects.get(0).endDate();

        for (int i = 1; i < validProjects.size(); i++) {
            ProjectPeriod next = validProjects.get(i);
            if (!next.startDate().isAfter(curEnd.plusDays(1))) {
                if (next.endDate().isAfter(curEnd)) {
                    curEnd = next.endDate();
                }
            } else {
                merged.add(new ProjectPeriod(curStart, curEnd));
                curStart = next.startDate();
                curEnd = next.endDate();
            }
        }
        merged.add(new ProjectPeriod(curStart, curEnd));

        // 총 근무 일수 계산
        long totalDays = 0;
        for (ProjectPeriod p : merged) {
            totalDays += ChronoUnit.DAYS.between(p.startDate(), p.endDate()) + 1;
        }

        // 일수 기준 계급 매핑 (365일 = 1년)
        double years = (double) totalDays / 365.0;
        if (years < 1) return "초초";
        if (years < 2) return "초중";
        if (years < 3) return "초상";
        if (years < 4) return "중초";
        if (years < 5) return "중중";
        if (years < 6) return "중상";
        if (years < 7) return "상초";
        if (years < 8) return "상중";
        return "상상";
    }

}
