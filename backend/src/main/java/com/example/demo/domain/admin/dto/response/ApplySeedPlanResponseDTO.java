package com.example.demo.domain.admin.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

/** 배분 미리보기 결과. 이 응답을 만들 때 DB 에는 아무것도 쓰지 않는다. */
@Getter
@Builder
public class ApplySeedPlanResponseDTO {

    private Long randomSeed;
    /** 실행 요청에 그대로 실어야 하는 기준 시각 */
    private String plannedAt;

    private Summary summary;
    private List<Allocation> allocations;

    /** 실행을 막지는 않지만 화면에 띄울 경고 (이력서 없는 봇 등) */
    private List<String> warnings;

    @Getter
    @Builder
    public static class Summary {
        private int targetProjects;
        private int totalApplications;
        /** 이번에 더해질 조회수 합계 */
        private int totalViews;
        private int usableBots;
        /** 이력서가 없어 이번 배분에서 빠진 봇 수 */
        private int botsWithoutResume;
    }

    @Getter
    @Builder
    public static class Allocation {
        private Long projectSq;
        private String projectTtl;
        private String companyNm;
        /** HOT / NORMAL / COLD */
        private String tier;
        /** 지금 이 공고의 project_candidate_cnt */
        private Integer currentCnt;
        /** 이번에 새로 붙일 건수 */
        private int plannedCnt;
        /** 지원 건수에 얹을 조회수 비율(%). 미리보기와 실행이 같은 값을 써야 결과가 재현된다 */
        private int viewExtraPct;
        /** 이번에 더해질 조회수 = plannedCnt + ceil(plannedCnt × viewExtraPct / 100) */
        private int plannedViewCnt;
        /** 배정된 봇 user_sq. 공고 안에서 중복은 없다 */
        private List<Long> botUserSqs;
    }
}
