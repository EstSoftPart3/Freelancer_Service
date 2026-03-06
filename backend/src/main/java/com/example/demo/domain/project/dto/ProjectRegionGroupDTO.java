package com.example.demo.domain.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRegionGroupDTO {
    private String sigungu; // 핀에 표시할 지역명 (예: 강남구)
    private Long projectCount; // 핀에 표시할 프로젝트 개수
    private Double latitude; // 시군구 중심 위도 (AVG 값)
    private Double longitude; // 시군구 중심 경도 (AVG 값)
}