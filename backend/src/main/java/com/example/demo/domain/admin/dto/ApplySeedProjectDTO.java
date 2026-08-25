package com.example.demo.domain.admin.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 봇 지원 대상이 될 수 있는 공고 한 건.
 *
 * <p>
 * {@code candidateCnt} 와 {@code botApplicationCnt} 를 나눠 담는다.
 * 앞은 {@code TBL_PROJECT_M.project_candidate_cnt}(FO 카드에 "지원 N건"으로 뜨는 값),
 * 뒤는 그중 봇이 만든 것이다. 회수하면 앞에서 뒤만큼이 빠져야 한다 — 화면에서 눈으로 대조하라고 둘 다 준다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class ApplySeedProjectDTO {

    private Long projectSq;
    private String projectTtl;
    private String companyNm;
    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;

    /** TBL_PROJECT_M.project_candidate_cnt — 실사용자 지원까지 포함한 값 */
    private Integer candidateCnt;

    /** 그중 봇이 만든 지원 건수 */
    private Integer botApplicationCnt;

    /** 티어(HOT/NORMAL/COLD) 판정 기준. 조회수가 높은 공고에 지원이 몰리는 게 자연스럽다 */
    private Integer viewCnt;
}
