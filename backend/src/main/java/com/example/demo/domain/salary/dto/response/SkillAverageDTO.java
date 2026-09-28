package com.example.demo.domain.salary.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * SalaryMapper.findSkillAverages 전용 원시 집계 결과 — 아직 상승률(%)로 변환되기 전.
 * SalaryStatsCalculator가 그룹 평균연봉과 비교해 SkillBumpDTO.bumpPct를 계산한다.
 */
@Getter
@Setter
public class SkillAverageDTO {
    private String skill;
    private Double avgSalary;
    private Long sampleCount;
}
