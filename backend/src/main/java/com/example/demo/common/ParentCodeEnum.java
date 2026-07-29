package com.example.demo.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ParentCodeEnum {

    MEMBER_TYPE(300),
    EMPLOYMENT(400),
    APPLICATION(500),
    SCRAP_TYPE(600),
    DEVELOPER_GRADE(700),
    PRO_APPLICATION(800),
    CONTRACT_TYPE(900),
    JOB_POSITION(1000),
    EDUCATION(2100),
    // 아래 4개는 컨트롤러·서비스에 매직넘버(1400/1500/2600)로 흩어져 있던 것을 모은 것이다.
    BOARD_TYPE(1400),
    BOARD_ADOPT_STATUS(1500),
    NOTIFICATION_TYPE(2600),
    // Phase 1 신설. 1600대는 이미 "댓글_구분"이라 3200번대를 쓴다(실사로 확정).
    BOARD_CATEGORY(3200);

    private long code;

}