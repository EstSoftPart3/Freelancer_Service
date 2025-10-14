package com.example.demo.domain.map.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapSearchRequest {
    
    // 사용자 위치 정보
    @NotNull(message = "사용자 위도는 필수입니다.")
    @DecimalMax(value = "90.0", message = "위도는 90도 이하여야 합니다.")  // 지구상 최대 위도
    @DecimalMin(value = "-90.0", message = "위도는 -90도 이상이어야 합니다.") // 지구상 최소 위도
    private Double userLatitude;
    
    @NotNull(message = "사용자 경도는 필수입니다.")
    @DecimalMax(value = "180.0", message = "경도는 180도 이하여야 합니다.")  // 지구상 최대 경도
    @DecimalMin(value = "-180.0", message = "경도는 -180도 이상이어야 합니다.") // 지구상 최소 경도
    private Double userLongitude;

    // 필터 조건들
    private Double radius = 5.0;        // 검색 반경 (km) - 기본값 5km
    private String jobType;             // 직무 필터 (프론트엔드, 백엔드, DBA)
    private String searchKeyword;       // 프로젝트명, 기업명 검색어
    
    // 페이징
    private Integer page = 0;           // 페이지 번호 (0부터 시작)
    private Integer size = 20;          // 한 페이지당 개수 (기본 20개)
}
