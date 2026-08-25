package com.example.demo.domain.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

/** 지원 등록 결과. */
@Getter
@Builder
public class ApplySeedCommitResponseDTO {

    private Long randomSeed;
    private int targetProjects;
    private int insertedApplications;
    /** 이번 실행에서 새로 만든 봇 이력서 수 */
    private int createdResumes;
}
