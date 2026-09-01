package com.example.demo.domain.admin.dto.request;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 봇 지원 배분 요청 (미리보기 · 실행 공용).
 *
 * <p>
 * {@code randomSeed} 와 {@code plannedAt} 을 미리보기 응답에서 그대로 되돌려받아야 같은 결과가 나온다.
 * 실행 때 {@code plannedAt} 이 없으면 거절한다 — 서버가 기준 시각을 "지금"으로 다시 잡으면
 * 지원일시 분산이 미리보기와 달라지기 때문이다. 커뮤니티 시더와 같은 규약이다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class ApplySeedRequestDTO {

    @NotNull(message = "randomSeed 는 필수다. 미리보기와 실행의 결과를 일치시키는 유일한 장치다.")
    private Long randomSeed;

    /** 미리보기 응답의 값을 그대로 돌려줄 것. 실행 시 null 이면 400 */
    private String plannedAt;

    /** 대상 공고. 비우면 채용중인 공고 전체 */
    private List<Long> projectSqs;

    // ── 티어별 지원 건수 범위 ────────────────────────────────────────────
    // 공고마다 같은 수가 붙으면 한눈에 기계가 만든 티가 난다. 조회수 기준으로 3티어로 갈라
    // 인기 공고에 몰리고 일부는 0건으로 남기는 편이 실제 서비스에 가깝다.

    @Min(0) @Max(100) private Integer hotMin;
    @Min(0) @Max(100) private Integer hotMax;
    @Min(0) @Max(100) private Integer normalMin;
    @Min(0) @Max(100) private Integer normalMax;
    @Min(0) @Max(100) private Integer coldMin;
    @Min(0) @Max(100) private Integer coldMax;

    // ── 조회수 가산 비율(%) ─────────────────────────────────────────────
    // 조회수 = 지원 건수 + (지원 건수 × 이 비율). 지원보다 항상 많게 만드는 게 목적이라
    // 하한이 0이면 안 된다.
    @Min(1) @Max(500) private Integer viewExtraMinPct;
    @Min(1) @Max(500) private Integer viewExtraMaxPct;

    // ── 기본값 ──────────────────────────────────────────────────────────
    public int hotMinOr(int d)    { return hotMin    == null ? d : hotMin; }
    public int hotMaxOr(int d)    { return hotMax    == null ? d : hotMax; }
    public int normalMinOr(int d) { return normalMin == null ? d : normalMin; }
    public int normalMaxOr(int d) { return normalMax == null ? d : normalMax; }
    public int coldMinOr(int d)   { return coldMin   == null ? d : coldMin; }
    public int coldMaxOr(int d)   { return coldMax   == null ? d : coldMax; }
    public int viewExtraMinPctOr(int d) { return viewExtraMinPct == null ? d : viewExtraMinPct; }
    public int viewExtraMaxPctOr(int d) { return viewExtraMaxPct == null ? d : viewExtraMaxPct; }
}
