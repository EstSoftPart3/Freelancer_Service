package com.example.demo.domain.project.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProjectApplicationStatus {
    APPLIED("APPLIED"), PASSED("PASSED"), FAILED("FAILED");

    private final String code;

}