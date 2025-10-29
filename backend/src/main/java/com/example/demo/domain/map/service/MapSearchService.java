package com.example.demo.domain.map.service;

import com.example.demo.domain.map.dto.MapProjectDto;
import com.example.demo.domain.map.dto.request.MapSearchRequest;
import com.example.demo.domain.map.dto.response.MapProjectResponse;
import com.example.demo.domain.map.dto.response.MapSearchResponse;
import com.example.demo.domain.map.mapper.MapSearchMapper;
import com.example.demo.domain.map.util.NaverMapUrlGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapSearchService {

    private final MapSearchMapper mapSearchMapper;
    private final NaverMapUrlGenerator naverMapUrlGenerator;

    // 사용자 주소 정보 조회
    public MapProjectDto getUserLocation(Long userId) {
        return mapSearchMapper.findUserAddress(userId);
    }

    // 사용자 ID로 주소를 조회하여 프로젝트 검색
    public MapSearchResponse searchProjectsByUserId(Long userId, double radius, String jobType, String keyword, int page, int size) {
        
        // 1단계: 사용자 주소 조회
        MapProjectDto userLocation = mapSearchMapper.findUserAddress(userId);
        if (userLocation == null) {
            throw new RuntimeException("사용자 주소를 찾을 수 없습니다. userId: " + userId);
        }
        
        // 2단계: 사용자 주소 기준 반경 내 프로젝트 조회
        List<MapProjectDto> projectDtos = mapSearchMapper.findProjectsWithinRadius(
            userLocation.getLatitude().doubleValue(),
            userLocation.getLongitude().doubleValue(),
            radius,
            jobType,
            keyword,
            page * size,
            size
        );
        
        // 3단계: 총 개수 조회
        int totalCount = mapSearchMapper.countProjectsWithinRadius(
            userLocation.getLatitude().doubleValue(),
            userLocation.getLongitude().doubleValue(),
            radius,
            jobType,
            keyword
        );
        
        // 4단계: DTO를 Response로 변환 (사용자 주소 정보 포함)
        return convertToResponse(projectDtos, totalCount, userLocation.getLatitude().doubleValue(), userLocation.getLongitude().doubleValue(), radius, jobType, keyword, userLocation.getAddress());
    }

    // 직접 좌표로 프로젝트 검색
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
        
        // 3단계: DTO를 Response로 변환 (사용자 주소 없음 - 기본값 사용)
        return convertToResponse(projectDtos, totalCount, request.getUserLatitude(), request.getUserLongitude(), request.getRadius(), request.getJobType(), request.getSearchKeyword(), "내위치");
    }

    // DTO를 Response로 변환하는 공통 메서드
    private MapSearchResponse convertToResponse(List<MapProjectDto> projectDtos, int totalCount, double userLat, double userLon, double radius, String jobType, String keyword, String userAddress) {
        // Stream API 사용
        List<MapProjectResponse> projects = projectDtos.stream()
            .map(dto -> convertToResponse(dto, userLat, userLon, userAddress))
            .collect(Collectors.toList());
        
        // 4단계: 페이징 정보 계산 (기본값 사용)
        int size = 20;
        int totalPages = (int) Math.ceil((double) totalCount / size);
        boolean hasNext = false; // 단순화
        boolean hasPrevious = false; // 단순화
        
        // 5단계: 최종 응답 객체 생성 (Builder 사용)
        return MapSearchResponse.builder()
            .projects(projects)
            .totalCount(totalCount)
            .currentPage(0)
            .totalPages(totalPages)
            .hasNext(hasNext)
            .hasPrevious(hasPrevious)
            .searchRadius(radius)
            .searchJobType(jobType)
            .searchKeyword(keyword)
            .userLatitude(userLat)
            .userLongitude(userLon)
            .build();
    }

    private MapProjectResponse convertToResponse(MapProjectDto dto, double userLat, double userLon, String userAddress) {
        
        // 네이버 길찾기 URL 생성 (EPSG:3857 좌표 변환 + 실제 주소 적용)
        String projectAddress = dto.getAddress() + (dto.getDetailAddress() != null ? " " + dto.getDetailAddress() : "");
        String naverMapUrl = naverMapUrlGenerator.generateRouteUrl(
            userLat,                             // 출발지: 사용자 위치
            userLon,
            dto.getLatitude().doubleValue(),     // 도착지: 프로젝트 위치
            dto.getLongitude().doubleValue(),
            userAddress,                         // 출발지 주소
            projectAddress                       // 도착지 주소
        );

        // Response 객체 생성
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
            .distance(dto.getDistance())  // SQL에서 계산된 거리 사용
            
            // 지도 관련 URL
            .naverMapUrl(naverMapUrl)
            
            // 프로젝트 상세 정보
            .projectSalary(dto.getProjectSalary())
            .projectStartDate(dto.getProjectStartDate())
            .projectEndDate(dto.getProjectEndDate())
            .recruitEndDt(dto.getRecruitEndDt())
            .build();
    }
    
}
