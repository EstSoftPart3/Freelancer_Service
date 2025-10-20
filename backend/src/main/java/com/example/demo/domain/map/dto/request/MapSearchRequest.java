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
    @DecimalMax(value = "90.0", message = "위도는 90도 이하여야 합니다.")
    @DecimalMin(value = "-90.0", message = "위도는 -90도 이상이어야 합니다.")
    private Double userLatitude;
    
    @NotNull(message = "사용자 경도는 필수입니다.")
    @DecimalMax(value = "180.0", message = "경도는 180도 이하여야 합니다.")
    @DecimalMin(value = "-180.0", message = "경도는 -180도 이상이어야 합니다.")
    private Double userLongitude;

    // 필터 조건들
    private Double radius = 5.0;        // 기본값 5km
    private String jobType;
    private String searchKeyword;
    
    // 페이징
    private Integer page = 0;
    private Integer size = 20;
}
