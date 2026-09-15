package com.example.demo.domain.salary.service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.demo.domain.salary.dto.response.CompanyRecommendationDTO;
import com.example.demo.domain.salary.dto.response.HistogramBucketDTO;
import com.example.demo.domain.salary.dto.response.JobChangeFeedItemDTO;
import com.example.demo.domain.salary.dto.response.JobChangeRawDTO;
import com.example.demo.domain.salary.dto.response.RankingRowDTO;
import com.example.demo.domain.salary.dto.response.SkillAverageDTO;
import com.example.demo.domain.salary.dto.response.SkillBumpDTO;
import com.example.demo.domain.salary.dto.response.YearPointDTO;
import com.example.demo.domain.salary.dto.response.YearProjectionDTO;
import com.example.demo.domain.salary.entity.SalarySubmission;

/**
 * 연봉 리포트·순위표의 통계 계산 — 전부 실데이터(+표본 부족 시 시드 혼합) 기반이다.
 * lib/salaryEstimate.ts·lib/salaryRanking.ts의 의사난수 로직을 실데이터 집계로 대체한 것이라
 * 프론트 인터페이스(SalaryReportData/RankingRow)를 최대한 그대로 유지한다.
 */
@Component
public class SalaryStatsCalculator {

    private static final List<String> YEAR_BUCKETS = List.of("1~2년", "3~5년", "6~9년", "10년+");
    private static final double MIN_GROWTH = 0.02;
    private static final double MAX_GROWTH = 0.30;
    private static final int YEARS_AHEAD = 5;
    private static final DateTimeFormatter YM_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    public int meanSalary(List<SalarySubmission> group) {
        return (int) Math.round(group.stream().mapToInt(SalarySubmission::getAnnualSalary).average().orElse(0));
    }

    /** 상위 N% — 그룹 내 나보다 연봉이 높은 사람 비율로 계산, 1~99로 clamp. */
    public int percentileTop(int mySalary, List<SalarySubmission> group) {
        long total = group.size();
        if (total == 0) return 50;
        long higher = group.stream().filter(s -> s.getAnnualSalary() > mySalary).count();
        int pct = (int) Math.round(100.0 * (higher + 1) / total);
        return Math.min(99, Math.max(1, pct));
    }

    /** 히스토그램 9구간 — 그룹의 실제 최소~최대 범위를 균등 분할한다. */
    public List<HistogramBucketDTO> histogram(int mySalary, List<SalarySubmission> group) {
        int bucketCount = 9;
        int min = group.stream().mapToInt(SalarySubmission::getAnnualSalary).min().orElse(mySalary);
        int max = group.stream().mapToInt(SalarySubmission::getAnnualSalary).max().orElse(mySalary);
        // 표본이 좁은 범위(예: 같은 연차대 30명이 몇백만원 안에 몰림)에 몰려 있으면 폭을 10 단위로
        // 반올림하는 과정에서 여러 구간의 from==to가 돼 버려(폭이 0으로 뭉개짐) 그 구간엔 아무도
        // 안 걸리고 내 위치도 엉뚱한 끝 구간으로 밀려난다 — 전체 폭이 최소한 bucketCount*10은
        // 되도록 위아래로 넓혀 각 구간이 최소 10 폭을 갖게 만든다.
        int minSpan = bucketCount * 10;
        if (max - min < minSpan) {
            int pad = (minSpan - (max - min) + 1) / 2;
            min -= pad;
            max += pad;
        }
        double bucketWidth = (max - min) / (double) bucketCount;

        List<HistogramBucketDTO> buckets = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) {
            int from = roundTo10(min + i * bucketWidth);
            int to = roundTo10(min + (i + 1) * bucketWidth);
            final int f = from, t = to;
            boolean isLast = i == bucketCount - 1;
            long count = group.stream()
                    .filter(s -> s.getAnnualSalary() >= f && (isLast ? s.getAnnualSalary() <= t : s.getAnnualSalary() < t))
                    .count();
            boolean isMine = mySalary >= f && (isLast ? mySalary <= t : mySalary < t);
            buckets.add(HistogramBucketDTO.builder().from(f).to(t).count((int) count).isMine(isMine).build());
        }
        // 극단값 등으로 내 연봉이 어느 구간에도 안 들어가면(범위 밖) 가까운 끝 구간에 표시
        if (buckets.stream().noneMatch(HistogramBucketDTO::isMine)) {
            HistogramBucketDTO target = mySalary < min ? buckets.get(0) : buckets.get(buckets.size() - 1);
            buckets.set(buckets.indexOf(target), HistogramBucketDTO.builder()
                    .from(target.getFrom()).to(target.getTo()).count(target.getCount()).isMine(true).build());
        }
        return buckets;
    }

    /**
     * 5년 연봉 추정 — 같은 직무·고용형태의 연차 구간별 중앙값을 근거로 성장률을 뽑는다.
     * normal은 다음 구간 중앙값, grind는 다음 구간 상위 25%(p75) 기준.
     */
    public YearProjectionDTO yearProjection(int mySalary, String careerBucket, List<SalarySubmission> careerSeries) {
        int bucketIdx = YEAR_BUCKETS.indexOf(careerBucket);
        double currentMedian = median(salariesInBucket(careerSeries, careerBucket));
        if (currentMedian <= 0) currentMedian = mySalary;

        double normalGrowth = 0.05;
        double grindGrowth = 0.12;
        if (bucketIdx >= 0 && bucketIdx < YEAR_BUCKETS.size() - 1) {
            List<Integer> nextSalaries = salariesInBucket(careerSeries, YEAR_BUCKETS.get(bucketIdx + 1));
            double nextMedian = median(nextSalaries);
            double nextP75 = percentile(nextSalaries, 75);
            // 연차 구간 사이 실제 연수를 다 알 수 없어 3년 간격으로 근사한다(1~2/3~5/6~9/10+ 평균 폭)
            if (nextMedian > 0) normalGrowth = Math.pow(nextMedian / currentMedian, 1.0 / 3) - 1;
            if (nextP75 > 0) grindGrowth = Math.pow(nextP75 / currentMedian, 1.0 / 3) - 1;
        }
        normalGrowth = clamp(normalGrowth, MIN_GROWTH, MAX_GROWTH);
        grindGrowth = clamp(Math.max(grindGrowth, normalGrowth), MIN_GROWTH, MAX_GROWTH);

        return YearProjectionDTO.builder()
                .normal(buildProjection(mySalary, normalGrowth))
                .grind(buildProjection(mySalary, grindGrowth))
                .build();
    }

    private List<YearPointDTO> buildProjection(int mySalary, double growth) {
        int currentYear = java.time.Year.now().getValue();
        List<YearPointDTO> points = new ArrayList<>();
        for (int i = 0; i <= YEARS_AHEAD; i++) {
            int salary = roundTo10(mySalary * Math.pow(1 + growth, i));
            points.add(YearPointDTO.builder().year(currentYear + i).salary(salary).build());
        }
        return points;
    }

    /** 미보유 기술스택 상승률 — 표본 5 미만은 이미 SQL HAVING에서 제외됨. 상승분만, 상위 6개. */
    public List<SkillBumpDTO> skillCandidates(int meanSalary, List<SkillAverageDTO> skillAverages) {
        if (meanSalary <= 0) return List.of();
        return skillAverages.stream()
                .map(s -> {
                    double bumpPct = Math.round(((s.getAvgSalary() / (double) meanSalary) - 1) * 1000) / 10.0;
                    return SkillBumpDTO.builder().skill(s.getSkill()).bumpPct(bumpPct).build();
                })
                .filter(s -> s.getBumpPct() > 0)
                .sorted(Comparator.comparingDouble(SkillBumpDTO::getBumpPct).reversed())
                .limit(6)
                .collect(Collectors.toList());
    }

    public List<CompanyRecommendationDTO> companyRecommendations(List<CompanyRecommendationDTO> raw) {
        return raw; // 매퍼에서 이미 3명 이상·상위 5개로 걸러져 있다
    }

    /** 이직 동향 피드 — jobChangedYm(YYYY-MM)을 상대시간 문구로 바꾼다. */
    public List<JobChangeFeedItemDTO> jobChangeFeed(List<JobChangeRawDTO> raw) {
        YearMonth now = YearMonth.now();
        return raw.stream()
                .map(r -> JobChangeFeedItemDTO.builder()
                        .maskedNickname(r.getMaskedNickname())
                        .fromSalary(r.getFromSalary())
                        .toSalary(r.getToSalary())
                        .relativeTime(relativeTimeFromYm(r.getJobChangedYm(), now))
                        .build())
                .limit(4)
                .collect(Collectors.toList());
    }

    private String relativeTimeFromYm(String ym, YearMonth now) {
        try {
            YearMonth then = YearMonth.parse(ym, YM_FORMAT);
            long monthsAgo = now.getYear() * 12L + now.getMonthValue() - (then.getYear() * 12L + then.getMonthValue());
            if (monthsAgo <= 0) return "이번 달";
            if (monthsAgo == 1) return "지난달";
            return monthsAgo + "개월 전";
        } catch (Exception e) {
            return "";
        }
    }

    /** 순위표 — dimension 필터로 이미 정렬·제한된 목록에 순위·마스킹 닉네임·인상률만 붙인다. */
    public List<RankingRowDTO> toRankingRows(List<SalarySubmission> rows) {
        List<RankingRowDTO> result = new ArrayList<>();
        int rank = 1;
        for (SalarySubmission s : rows) {
            Double changePct = null;
            if (s.getPrevAnnualSalary() != null && s.getPrevAnnualSalary() > 0) {
                changePct = Math.round(((s.getAnnualSalary() / (double) s.getPrevAnnualSalary()) - 1) * 1000) / 10.0;
            }
            String nickname = "Y".equals(s.getIsSeedYn()) ? s.getSeedNickname() : maskNickname(s.getUserNickname());
            result.add(RankingRowDTO.builder()
                    .rank(rank++)
                    .maskedNickname(nickname)
                    .job(s.getJobNm())
                    .years(s.getCareerBucket())
                    .region(s.getRegionNm())
                    .salary(s.getAnnualSalary())
                    .changePct(changePct)
                    .build());
        }
        return result;
    }

    private String maskNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) return "**";
        return nickname.substring(0, 1) + "**";
    }

    private List<Integer> salariesInBucket(List<SalarySubmission> series, String bucket) {
        return series.stream()
                .filter(s -> bucket.equals(s.getCareerBucket()))
                .map(SalarySubmission::getAnnualSalary)
                .collect(Collectors.toList());
    }

    private double median(List<Integer> values) {
        if (values.isEmpty()) return 0;
        List<Integer> sorted = values.stream().sorted().collect(Collectors.toList());
        int mid = sorted.size() / 2;
        return sorted.size() % 2 == 0 ? (sorted.get(mid - 1) + sorted.get(mid)) / 2.0 : sorted.get(mid);
    }

    private double percentile(List<Integer> values, int pct) {
        if (values.isEmpty()) return 0;
        List<Integer> sorted = values.stream().sorted().collect(Collectors.toList());
        int idx = (int) Math.ceil(pct / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(sorted.size() - 1, idx)));
    }

    private double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private int roundTo10(double n) {
        return (int) (Math.round(n / 10.0) * 10);
    }
}
