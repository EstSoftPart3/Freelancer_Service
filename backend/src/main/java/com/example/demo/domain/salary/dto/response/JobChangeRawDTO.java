package com.example.demo.domain.salary.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * SalaryMapper.findJobChangeFeed 전용 원시 결과 — jobChangedYm(YYYY-MM)을 아직 상대시간
 * 문구로 바꾸기 전. SalaryStatsCalculator가 "이번 달"/"지난달"/"N개월 전"으로 변환한다.
 */
@Getter
@Setter
public class JobChangeRawDTO {
    private String maskedNickname;
    private Integer fromSalary;
    private Integer toSalary;
    private String jobChangedYm;
}
