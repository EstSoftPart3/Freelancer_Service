package com.example.demo.domain.map.dto.response;

import lombok.*;
import java.util.List;

/**
 * 지도 검색 결과 응답 DTO
 * 
 * 기능 설명:
 * - 검색 결과와 페이징 정보를 모두 담는 클래스
 * - projects: 실제 프로젝트 리스트
 * - totalCount: 전체 검색된 프로젝트 개수
 * - 페이징 정보: 현재 페이지, 전체 페이지 등
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapSearchResponse {
    
    // 검색 결과 프로젝트 리스트
    private List<MapProjectResponse> projects;
    
    // 페이징 정보
    private Integer totalCount;         // 전체 검색된 프로젝트 개수
    private Integer currentPage;        // 현재 페이지 (0부터 시작)
    private Integer totalPages;         // 전체 페이지 개수
    private boolean hasNext;            // 다음 페이지가 있는지
    private boolean hasPrevious;        // 이전 페이지가 있는지
    
    // 검색 조건 정보 (사용자가 무엇으로 검색했는지 기록)
    private Double searchRadius;        // 검색한 반경
    private String searchJobType;       // 검색한 직무
    private String searchKeyword;       // 검색한 키워드
    
    // 사용자 위치 정보 (지도 중심점 표시용)
    private Double userLatitude;        // 사용자 위도
    private Double userLongitude;       // 사용자 경도
}
