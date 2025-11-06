package com.example.demo.domain.map.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapSearchResponse {
    
    // 검색 결과 프로젝트 리스트
    private List<MapProjectResponse> projects;
    
    // 페이징 정보
    private Integer totalCount;
    private Integer currentPage;
    private Integer totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    
    // 검색 조건 정보
    private Double searchRadius;
    private String searchJobType;
    private String searchKeyword;
    
    // 사용자 위치 정보
    private Double userLatitude;
    private Double userLongitude;
}
