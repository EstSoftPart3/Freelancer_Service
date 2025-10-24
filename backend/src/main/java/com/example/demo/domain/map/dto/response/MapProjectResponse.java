package com.example.demo.domain.map.dto.response;

import lombok.*;
import java.math.BigDecimal;

// 지도에서 표시될 프로젝트 정보 응답 DTO
// - 지도에 마커로 표시할 프로젝트의 모든 정보
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapProjectResponse {
    
    // 프로젝트 기본 정보
    private Long projectSq;
    private String projectTitle;
    private String companyName;
    private String jobType;
    
    // 주소 정보
    private String address;
    private String detailAddress;
    
    // 위치 정보 (지도 표시용)
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double distance;
    
    // 지도 관련 URL
    private String naverMapUrl;
    
    // 프로젝트 상세 정보
    private Long projectSalary;
    private String projectStartDate;
    private String projectEndDate;
    private String recruitEndDt;        // 모집 마감일
}
