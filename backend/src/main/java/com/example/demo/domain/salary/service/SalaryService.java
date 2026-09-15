package com.example.demo.domain.salary.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.salary.dto.request.SalarySubmissionRequest;
import com.example.demo.domain.salary.dto.response.CompanyRecommendationDTO;
import com.example.demo.domain.salary.dto.response.JobChangeRawDTO;
import com.example.demo.domain.salary.dto.response.RankingRowDTO;
import com.example.demo.domain.salary.dto.response.SalaryRankingResponse;
import com.example.demo.domain.salary.dto.response.SalaryReportResponse;
import com.example.demo.domain.salary.dto.response.SalarySubmissionResponse;
import com.example.demo.domain.salary.dto.response.SkillAverageDTO;
import com.example.demo.domain.salary.entity.SalarySubmission;
import com.example.demo.domain.salary.mapper.SalaryMapper;

import lombok.RequiredArgsConstructor;

/**
 * 연봉계산기·리포트·순위표 전용 도메인. lib/salaryEstimate.ts·lib/salaryRanking.ts가 프론트에서
 * 시드 기반 의사난수로 만들던 통계를 실데이터 집계로 대체한다.
 *
 * <p>
 * 비교 그룹(직무+연차+지역+고용형태)의 실표본이 {@value #MIN_REAL_SAMPLE} 건 미만이면 시드를
 * 섞는다(is_seed_yn='Y', 회사명·이직정보 없음). 그래도 표본이 부족하면 지역 → 연차 순으로
 * 조건을 완화한다 — 직무와 고용형태는 끝까지 고정한다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class SalaryService {

    private static final int MIN_REAL_SAMPLE = 30;
    private static final int MIN_GROUP_SAMPLE = 30;
    private static final Set<String> EMPLOYMENT_TYPES = Set.of("EMPLOYED", "FREELANCE");
    private static final Set<String> YEAR_BUCKETS = Set.of("1~2년", "3~5년", "6~9년", "10년+");
    private static final DateTimeFormatter YM_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final SalaryMapper salaryMapper;
    private final SalaryStatsCalculator calculator;

    public SalarySubmissionResponse getMySubmission(Long userSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        SalarySubmission submission = salaryMapper.findByUserSq(userSq);
        if (submission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "제출 이력이 없습니다.");
        }
        List<String> skills = salaryMapper.findSkillsBySubmissionSq(submission.getSalarySubmissionSq());
        return SalarySubmissionResponse.builder()
                .employmentType(submission.getEmploymentType())
                .jobNm(submission.getJobNm())
                .careerBucket(submission.getCareerBucket())
                .regionNm(submission.getRegionNm())
                .annualSalary(submission.getAnnualSalary())
                .skillTagNms(skills)
                .ageBand(submission.getAgeBand())
                .educationNm(submission.getEducationNm())
                .companySize(submission.getCompanySize())
                .companyType(submission.getCompanyType())
                .positionNm(submission.getPositionNm())
                .teamSize(submission.getTeamSize())
                .employmentSubtype(submission.getEmploymentSubtype())
                .remoteType(submission.getRemoteType())
                .bonusAmount(submission.getBonusAmount())
                .stockOpt(submission.getStockOpt())
                .jobChangeCount(submission.getJobChangeCount())
                .companyNm(submission.getCompanyNm())
                .prevAnnualSalary(submission.getPrevAnnualSalary())
                .jobChangedYm(submission.getJobChangedYm())
                .build();
    }

    @Transactional
    public Long submit(SalarySubmissionRequest request) {
        // getMySubmission/getReport와 같은 이유의 같은 가드 — /salary/submissions는
        // JwtAuthenticationFilter.EXCLUDE_URLS에 없어 만료/무효 토큰이면 필터 단계에서 이미
        // 401로 끊기지만, vote/interview 그룹에서 반복된 사고 패턴이라 방어적으로 한 번 더 막는다.
        if (request.getUserSq() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        validate(request);

        SalarySubmission existing = salaryMapper.findByUserSq(request.getUserSq());
        SalarySubmission submission = toEntity(request);
        Long submissionSq;

        if (existing == null) {
            try {
                salaryMapper.insert(submission);
                submissionSq = submission.getSalarySubmissionSq();
            } catch (DuplicateKeyException e) {
                // 동시 제출 경합(더블클릭·두 탭) — findByUserSq 이후 다른 요청이 먼저 INSERT해
                // uq_salary_submission_user 유니크 제약에 걸린 경우. MariaDB 기본
                // REPEATABLE READ 에서는 같은 트랜잭션 안에서 재조회해도 맨 처음 SELECT의
                // 스냅샷을 그대로 봐서 여전히 null이 나온다(재조회로 update 전환 불가) —
                // VoteService.castBallot과 같은 패턴으로 그냥 409로 알리고 클라이언트가
                // 다시 요청하게 한다(새 요청은 새 트랜잭션이라 정상적으로 update 경로를 탄다).
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 제출 처리 중입니다. 잠시 후 다시 시도해주세요.");
            }
        } else {
            submission.setSalarySubmissionSq(existing.getSalarySubmissionSq());
            salaryMapper.update(submission);
            salaryMapper.deleteSkillsBySubmissionSq(existing.getSalarySubmissionSq());
            submissionSq = existing.getSalarySubmissionSq();
        }
        for (String skill : request.getSkillTagNms()) {
            salaryMapper.insertSkill(submissionSq, skill);
        }
        return submissionSq;
    }

    public SalaryReportResponse getReport(Long userSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        SalarySubmission mine = salaryMapper.findByUserSq(userSq);
        if (mine == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "먼저 연봉계산기를 제출해주세요.");
        }

        String jobNm = mine.getJobNm();
        String employmentType = mine.getEmploymentType();
        String careerBucket = mine.getCareerBucket();
        String regionNm = mine.getRegionNm();
        List<String> relaxedConditions = new ArrayList<>();

        GroupResolution resolution = resolveGroup(jobNm, careerBucket, regionNm, employmentType, relaxedConditions);
        List<SalarySubmission> group = resolution.rows();
        boolean useCareerFilter = !relaxedConditions.contains("연차");
        boolean useRegionFilter = !relaxedConditions.contains("지역");
        String careerFilter = useCareerFilter ? careerBucket : null;
        String regionFilter = useRegionFilter ? regionNm : null;

        int meanSalary = calculator.meanSalary(group);
        int mySalary = mine.getAnnualSalary();
        long realCount = resolution.realCount();
        boolean includesSeed = group.stream().anyMatch(s -> "Y".equals(s.getIsSeedYn()));

        List<SalarySubmission> careerSeries = salaryMapper.findByJobAndEmployment(jobNm, employmentType);
        List<String> mySkills = salaryMapper.findSkillsBySubmissionSq(mine.getSalarySubmissionSq());
        List<SkillAverageDTO> skillAverages = salaryMapper.findSkillAverages(jobNm, careerFilter, regionFilter,
                employmentType, mySkills, includesSeed);
        List<CompanyRecommendationDTO> companies = salaryMapper.findCompanyRecommendations(jobNm, careerFilter,
                regionFilter, employmentType);
        String yearMonthFrom = LocalDate.now().minusMonths(3).format(YM_FORMAT);
        List<JobChangeRawDTO> jobChangeRaw = salaryMapper.findJobChangeFeed(jobNm, yearMonthFrom, 4);

        return SalaryReportResponse.builder()
                .mySalary(mySalary)
                .meanSalary(meanSalary)
                .percentileTop(calculator.percentileTop(mySalary, group))
                .histogram(calculator.histogram(mySalary, group))
                .yearProjection(calculator.yearProjection(mySalary, careerBucket, careerSeries))
                .skillCandidates(calculator.skillCandidates(meanSalary, skillAverages))
                .companyRecommendations(calculator.companyRecommendations(companies))
                .jobChangeFeed(calculator.jobChangeFeed(jobChangeRaw))
                .sampleCount(group.size())
                .realSampleCount((int) realCount)
                .includesSeed(includesSeed)
                .relaxedConditions(relaxedConditions)
                .build();
    }

    public SalaryRankingResponse getRanking(String dimension, String job, String years, String region) {
        String jobFilter = "job".equals(dimension) ? job : null;
        String yearsFilter = "years".equals(dimension) ? years : null;
        String regionFilter = "region".equals(dimension) ? region : null;

        List<SalarySubmission> rows = salaryMapper.findRanking(jobFilter, yearsFilter, regionFilter, 20);
        Long totalCount = salaryMapper.countRanking(jobFilter, yearsFilter, regionFilter);
        List<RankingRowDTO> rankingRows = calculator.toRankingRows(rows);
        boolean includesSeed = rows.stream().anyMatch(s -> "Y".equals(s.getIsSeedYn()));

        return SalaryRankingResponse.builder()
                .rows(rankingRows)
                .totalCount(totalCount.intValue())
                .includesSeed(includesSeed)
                .build();
    }

    /** resolveGroup이 이미 계산한 실표본 수를 getReport에 그대로 넘겨주기 위한 결과 묶음 —
     * 안 그러면 같은 조건으로 countRealInGroup을 한 번 더 호출하게 된다. */
    private record GroupResolution(List<SalarySubmission> rows, long realCount) {
    }

    /** 실표본이 부족하면 시드를 섞고, 그래도 부족하면 지역 → 연차 순으로 조건을 완화한다. */
    private GroupResolution resolveGroup(String jobNm, String careerBucket, String regionNm,
            String employmentType, List<String> relaxedConditions) {
        long real = salaryMapper.countRealInGroup(jobNm, careerBucket, regionNm, employmentType);
        boolean includeSeed = real < MIN_REAL_SAMPLE;
        List<SalarySubmission> group = salaryMapper.findGroup(jobNm, careerBucket, regionNm, employmentType, includeSeed);
        if (group.size() >= MIN_GROUP_SAMPLE) {
            return new GroupResolution(group, real);
        }

        relaxedConditions.add("지역");
        real = salaryMapper.countRealInGroup(jobNm, careerBucket, null, employmentType);
        includeSeed = real < MIN_REAL_SAMPLE;
        group = salaryMapper.findGroup(jobNm, careerBucket, null, employmentType, includeSeed);
        if (group.size() >= MIN_GROUP_SAMPLE) {
            return new GroupResolution(group, real);
        }

        relaxedConditions.add("연차");
        real = salaryMapper.countRealInGroup(jobNm, null, null, employmentType);
        group = salaryMapper.findGroup(jobNm, null, null, employmentType, true);
        return new GroupResolution(group, real);
    }

    private void validate(SalarySubmissionRequest request) {
        if (!EMPLOYMENT_TYPES.contains(request.getEmploymentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "고용형태를 선택해주세요.");
        }
        if (request.getJobNm() == null || request.getJobNm().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "직무를 선택해주세요.");
        }
        if (!YEAR_BUCKETS.contains(request.getCareerBucket())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "연차를 선택해주세요.");
        }
        if (request.getRegionNm() == null || request.getRegionNm().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지역을 선택해주세요.");
        }
        if (request.getAnnualSalary() == null || request.getAnnualSalary() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "연봉을 입력해주세요.");
        }
        if (request.getSkillTagNms() == null || request.getSkillTagNms().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기술스택을 1개 이상 선택해주세요.");
        }
    }

    private SalarySubmission toEntity(SalarySubmissionRequest request) {
        SalarySubmission submission = new SalarySubmission();
        submission.setUserSq(request.getUserSq());
        submission.setEmploymentType(request.getEmploymentType());
        submission.setJobNm(request.getJobNm());
        submission.setCareerBucket(request.getCareerBucket());
        submission.setRegionNm(request.getRegionNm());
        submission.setAnnualSalary(request.getAnnualSalary());
        submission.setAgeBand(request.getAgeBand());
        submission.setEducationNm(request.getEducationNm());
        submission.setCompanySize(request.getCompanySize());
        submission.setCompanyType(request.getCompanyType());
        submission.setPositionNm(request.getPositionNm());
        submission.setTeamSize(request.getTeamSize());
        submission.setEmploymentSubtype(request.getEmploymentSubtype());
        submission.setRemoteType(request.getRemoteType());
        submission.setBonusAmount(request.getBonusAmount());
        submission.setStockOpt(request.getStockOpt());
        submission.setJobChangeCount(request.getJobChangeCount());
        submission.setCompanyNm(request.getCompanyNm());
        submission.setPrevAnnualSalary(request.getPrevAnnualSalary());
        submission.setJobChangedYm(request.getJobChangedYm());
        return submission;
    }
}
