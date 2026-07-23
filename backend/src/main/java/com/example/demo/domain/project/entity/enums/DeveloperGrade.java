package com.example.demo.domain.project.entity.enums;

import java.util.Arrays;

public enum DeveloperGrade {
    LV1(701L, "초초", 0, 1),
    LV2(702L, "초중", 1, 2),
    LV3(703L, "초상", 2, 3),
    LV4(704L, "중초", 3, 4),
    LV5(705L, "중중", 4, 5),
    LV6(706L, "중상", 5, 6),
    LV7(707L, "상초", 6, 7),
    LV8(708L, "상중", 7, 8),
    LV9(709L, "상상", 8, null);

    private final Long gradeCd;
    private final String gradeNm;
    private final int minYear;
    private final Integer maxYear;

    DeveloperGrade(Long gradeCd, String gradeNm, int minYear, Integer maxYear) {
        this.gradeCd = gradeCd;
        this.gradeNm = gradeNm;
        this.minYear = minYear;
        this.maxYear = maxYear;
    }

    public Long getGradeCd() { return gradeCd; }
    public String getGradeNm() { return gradeNm; }

    public static DeveloperGrade fromCode(Long gradeCd) {
        return Arrays.stream(values())
                .filter(g -> g.gradeCd.equals(gradeCd))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("정의되지 않은 등급 코드: " + gradeCd));
    }

    public static DeveloperGrade fromYears(double years) {
        return Arrays.stream(values())
                .filter(g -> years >= g.minYear && (g.maxYear == null || years < g.maxYear))
                .findFirst()
                .orElse(LV9); // 8년 이상은 전부 최고 등급
    }
}
