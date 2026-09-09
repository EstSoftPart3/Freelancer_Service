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
    EDUCATION(2100);
    private long code;

}