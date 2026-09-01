package com.example.demo.domain.project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/** TBL_PROJECT_RECRUIT_HEADCOUNT_S 에 넣을 한 행. 등급 이름은 이미 코드로 바뀐 상태다. */
@Getter
@Setter
@AllArgsConstructor
public class HeadcountInsertRequest {
    private Long projectSq;
    /** 공통코드 700 하위. null 이면 "총 N명" 모드 */
    private Long developerGradeCd;
    private Integer headcount;
}
