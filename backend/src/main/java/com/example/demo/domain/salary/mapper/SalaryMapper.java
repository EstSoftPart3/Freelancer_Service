package com.example.demo.domain.salary.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.salary.dto.response.CompanyRecommendationDTO;
import com.example.demo.domain.salary.dto.response.JobChangeRawDTO;
import com.example.demo.domain.salary.dto.response.SkillAverageDTO;
import com.example.demo.domain.salary.entity.SalarySubmission;

@Mapper
public interface SalaryMapper {

    void insert(SalarySubmission submission);

    void update(SalarySubmission submission);

    SalarySubmission findByUserSq(@Param("userSq") Long userSq);

    List<String> findSkillsBySubmissionSq(@Param("salarySubmissionSq") Long salarySubmissionSq);

    void insertSkill(@Param("salarySubmissionSq") Long salarySubmissionSq, @Param("skillTagNm") String skillTagNm);

    void deleteSkillsBySubmissionSq(@Param("salarySubmissionSq") Long salarySubmissionSq);

    /**
     * 통계 비교 그룹 조회 — job_nm은 항상 고정, career_bucket·region_nm은 조건 완화 시 null로
     * 넘겨 그 축을 무시한다. includeSeed=false면 실데이터만.
     */
    List<SalarySubmission> findGroup(@Param("jobNm") String jobNm, @Param("careerBucket") String careerBucket,
            @Param("regionNm") String regionNm, @Param("employmentType") String employmentType,
            @Param("includeSeed") boolean includeSeed);

    Long countRealInGroup(@Param("jobNm") String jobNm, @Param("careerBucket") String careerBucket,
            @Param("regionNm") String regionNm, @Param("employmentType") String employmentType);

    /** 연차 구간별 중앙값 계산용 — 같은 직무·고용형태의 전 지역 표본(실+시드). */
    List<SalarySubmission> findByJobAndEmployment(@Param("jobNm") String jobNm,
            @Param("employmentType") String employmentType);

    /**
     * 미보유 스킬별 평균연봉 — 그룹 필터와 동일 조건, 표본 5 미만은 제외(HAVING).
     * includeSeed=false면 실데이터만(findGroup/findCompanyRecommendations/findJobChangeFeed와
     * 같은 기준을 따라야 한다 — 실표본이 충분한 그룹인데도 스킬 상승률에 시드가 섞이면 안 된다).
     */
    List<SkillAverageDTO> findSkillAverages(@Param("jobNm") String jobNm, @Param("careerBucket") String careerBucket,
            @Param("regionNm") String regionNm, @Param("employmentType") String employmentType,
            @Param("excludeSkills") List<String> excludeSkills, @Param("includeSeed") boolean includeSeed);

    /** 같은 조건 개발자가 다니는 회사 — 실데이터만, 3명 이상인 회사만. */
    List<CompanyRecommendationDTO> findCompanyRecommendations(@Param("jobNm") String jobNm,
            @Param("careerBucket") String careerBucket, @Param("regionNm") String regionNm,
            @Param("employmentType") String employmentType);

    /** 최근 이직 동향 — 실+시드, 같은 직무·고용형태(프리랜서는 월단가라 연봉과 섞으면 안 된다), 최근 N개월(yearMonthFrom 이상). */
    List<JobChangeRawDTO> findJobChangeFeed(@Param("jobNm") String jobNm,
            @Param("employmentType") String employmentType,
            @Param("yearMonthFrom") String yearMonthFrom, @Param("limit") int limit);

    /** 순위표 — dimension에 따라 job/years/region 중 필요한 것만 필터, 나머지는 null. */
    List<SalarySubmission> findRanking(@Param("jobNm") String jobNm, @Param("careerBucket") String careerBucket,
            @Param("regionNm") String regionNm, @Param("limit") int limit);

    Long countRanking(@Param("jobNm") String jobNm, @Param("careerBucket") String careerBucket,
            @Param("regionNm") String regionNm);
}
