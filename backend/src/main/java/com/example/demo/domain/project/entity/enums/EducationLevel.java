package com.example.demo.domain.project.entity.enums;

import java.util.Arrays;

public enum EducationLevel {
    ANY(2101L, 0),           // 학력 무관
    HIGH_SCHOOL_BELOW(2102L, 1), // 고졸 이하
    HIGH_SCHOOL_ABOVE(2103L, 2), // 고졸 이상
    COLLEGE(2104L, 3),           // 대학(2,3년제)
    BACHELOR_ABOVE(2105L, 4),    // 대졸 이상
    MASTER_ABOVE(2106L, 5),      // 석사 이상
    DOCTOR_ABOVE(2107L, 6);      // 박사 이상

    private final Long codeSq;
    private final int rank; // 랭크가 높을수록 상위 학력

    EducationLevel(Long codeSq, int rank) {
        this.codeSq = codeSq;
        this.rank = rank;
    }

    public Long getCodeSq() { return codeSq; }
    public int getRank() { return rank; }

    public static EducationLevel fromCode(Long codeSq) {
        return Arrays.stream(values())
                .filter(e -> e.codeSq.equals(codeSq))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("정의되지 않은 학력 코드: " + codeSq));
    }
}
