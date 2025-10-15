package com.example.demo.domain.map.service;

import com.example.demo.domain.map.dto.MapProjectDto;
import com.example.demo.domain.map.dto.request.MapSearchRequest;
import com.example.demo.domain.map.dto.response.MapProjectResponse;
import com.example.demo.domain.map.dto.response.MapSearchResponse;
import com.example.demo.domain.map.mapper.MapSearchMapper;
import com.example.demo.domain.map.util.DistanceCalculator;
import com.example.demo.domain.map.util.NaverMapUrlGenerator;
import com.example.demo.domain.map.service.VWorldMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapSearchService {

    private final MapSearchMapper mapSearchMapper;        // 데이터베이스 조회
    private final DistanceCalculator distanceCalculator;  // 거리 계산
    private final NaverMapUrlGenerator naverMapUrlGenerator; // 네이버 URL 생성
    private final VWorldMapService vWorldMapService;      // VWorld 지도

    public MapSearchResponse searchProjects(MapSearchRequest request) {
        
        // 1단계: 데이터베이스에서 반경 내 프로젝트 조회
        List<MapProjectDto> projectDtos = mapSearchMapper.findProjectsWithinRadius(
            request.getUserLatitude(),    // 사용자 위도
            request.getUserLongitude(),   // 사용자 경도
            request.getRadius(),          // 검색 반경
            request.getJobType(),         // 직무 필터
            request.getSearchKeyword(),   // 검색 키워드
            request.getPage() * request.getSize(),  // 오프셋 계산
            request.getSize()             // 가져올 개수
        );
        
        // 2단계: 총 개수 조회
        int totalCount = mapSearchMapper.countProjectsWithinRadius(
            request.getUserLatitude(),
            request.getUserLongitude(),
            request.getRadius(),
            request.getJobType(),
            request.getSearchKeyword()
        );
        
        // 3단계: DTO를 Response로 변환
        // Stream API 사용
        List<MapProjectResponse> projects = projectDtos.stream()
            .map(dto -> convertToResponse(dto, request))
            .collect(Collectors.toList());
        
        // 4단계: 페이징 정보 계산
        int totalPages = (int) Math.ceil((double) totalCount / request.getSize());
        boolean hasNext = request.getPage() < totalPages - 1;
        boolean hasPrevious = request.getPage() > 0;
        
        // 5단계: 최종 응답 객체 생성 (Builder 사용)
        return MapSearchResponse.builder()
            .projects(projects)
            .totalCount(totalCount)
            .currentPage(request.getPage())
            .totalPages(totalPages)
            .hasNext(hasNext)
            .hasPrevious(hasPrevious)
            .searchRadius(request.getRadius())
            .searchJobType(request.getJobType())
            .searchKeyword(request.getSearchKeyword())
            .userLatitude(request.getUserLatitude())
            .userLongitude(request.getUserLongitude())
            .build();
    }

    private MapProjectResponse convertToResponse(MapProjectDto dto, MapSearchRequest request) {
        
        // 1단계: 거리 계산
        double distance = distanceCalculator.calculateDistance(
            request.getUserLatitude(),           // 사용자 위도
            request.getUserLongitude(),          // 사용자 경도
            dto.getLatitude().doubleValue(),     // 프로젝트 위도
            dto.getLongitude().doubleValue()     // 프로젝트 경도
        );
        
        // 2단계: 네이버 길찾기 URL 생성 (사용자 → 프로젝트)
        String naverMapUrl = naverMapUrlGenerator.generateRouteUrl(
            request.getUserLatitude(),           // 출발지: 사용자 위치
            request.getUserLongitude(),
            dto.getLatitude().doubleValue(),     // 도착지: 프로젝트 위치 (BigDecimal → double 변환)
            dto.getLongitude().doubleValue()
        );
        
        // 3단계: VWorld 정적 지도 이미지 URL 생성
        String mapImageUrl = vWorldMapService.generateStaticMapUrl(
            dto.getLatitude(),
            dto.getLongitude()
        );
        
        // 4단계: Response 객체 생성 (Builder 패턴)
        return MapProjectResponse.builder()
            // 프로젝트 기본 정보
            .projectSq(dto.getProjectSq())
            .projectTitle(dto.getProjectTitle())
            .companyName(dto.getCompanyName())
            .jobType(dto.getJobType())
            .address(dto.getAddress())
            .detailAddress(dto.getDetailAddress())
            
            // 위치 정보
            .latitude(dto.getLatitude())
            .longitude(dto.getLongitude())
            .distance(distanceCalculator.roundDistance(distance))  // 거리 반올림
            
            // 지도 관련 URL
            .mapImageUrl(mapImageUrl)     // VWorld 정적 지도
            .naverMapUrl(naverMapUrl)     // 네이버 길찾기 딥링크
            
            // 프로젝트 상세 정보
            .projectSalary(dto.getProjectSalary())
            .projectStartDate(dto.getProjectStartDate())
            .projectEndDate(dto.getProjectEndDate())
            .build();
    }
    
    /**
     * VWorld 지도 이미지 URL 생성
     */
    public String generateVWorldMapUrl(double latitude, double longitude) {
        return vWorldMapService.generateStaticMapUrl(
            java.math.BigDecimal.valueOf(latitude),
            java.math.BigDecimal.valueOf(longitude)
        );
    }
    
    /**
     * 네이버 길찾기 URL 생성
     */
    public String generateNaverRouteUrl(double startLat, double startLon, double endLat, double endLon) {
        return naverMapUrlGenerator.generateRouteUrl(startLat, startLon, endLat, endLon);
    }
}
