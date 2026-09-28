package com.example.demo.domain.salary.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingRowDTO {
    private Integer rank;
    private String maskedNickname;
    private String job;
    private String years;
    private String region;
    private Integer salary;
    // 직전 연봉 대비 인상률. 없으면 null(프론트에서 하이픈 등으로 표기)
    private Double changePct;
}
