package com.example.demo.domain.salary.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * GET /salary/report — 프론트 lib/salaryEstimate.ts의 SalaryReportData를 그대로 대체한다.
 * sampleCount 등 표본 메타는 프론트 신규 표기("표본 N명, 실제 M명")용으로 추가된 필드다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryReportResponse {
    private Integer mySalary;
    private Integer meanSalary;
    private Integer percentileTop;
    // 비교 그룹 안 내 실제 등수(나보다 연봉 높은 사람 수 + 1) — percentileTop 을 되돌려 계산하면 clamp·반올림으로 왜곡된다.
    private Integer myRank;
    private List<HistogramBucketDTO> histogram;
    private YearProjectionDTO yearProjection;
    private List<SkillBumpDTO> skillCandidates;
    private List<CompanyRecommendationDTO> companyRecommendations;
    private List<JobChangeFeedItemDTO> jobChangeFeed;

    // 표본 메타 — 시드 혼합·조건 완화 여부를 화면에 투명하게 공개하기 위함
    private Integer sampleCount;
    private Integer realSampleCount;
    private boolean includesSeed;
    private List<String> relaxedConditions;
}
