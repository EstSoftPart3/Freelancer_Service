package com.example.demo.domain.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationGroupInfo {
    private Long groupCompanySq; // 기업 SQ (없으면 -1로 개인)
    private int applicantCount; // 그룹 내 지원자 수
}
