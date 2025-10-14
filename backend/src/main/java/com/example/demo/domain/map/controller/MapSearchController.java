package com.example.demo.domain.map.controller;

import com.example.demo.domain.map.dto.request.MapSearchRequest;
import com.example.demo.domain.map.dto.response.MapSearchResponse;
import com.example.demo.domain.map.service.MapSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapSearchController {
    
    private final MapSearchService mapSearchService;

    @PostMapping("/search")
    public ResponseEntity<MapSearchResponse> searchProjects(
            @Valid @RequestBody MapSearchRequest request) {

        
        MapSearchResponse response = mapSearchService.searchProjects(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<MapSearchResponse> searchProjectsSimple(
            @RequestParam double lat,                              // 사용자 위도
            @RequestParam double lon,                              // 사용자 경도
            @RequestParam(defaultValue = "5.0") double radius,     // 반경 (기본값 5km)
            @RequestParam(required = false) String jobType,        // 직무
            @RequestParam(required = false) String keyword,        // 검색어
            @RequestParam(defaultValue = "0") int page,            // 페이지 (기본값 0)
            @RequestParam(defaultValue = "20") int size) {         // 개수 (기본값 20)
        
        // GET 파라미터를 MapSearchRequest 객체로 변환
        MapSearchRequest request = MapSearchRequest.builder()
            .userLatitude(lat)
            .userLongitude(lon)
            .radius(radius)
            .jobType(jobType)
            .searchKeyword(keyword)
            .page(page)
            .size(size)
            .build();
        
        MapSearchResponse response = mapSearchService.searchProjects(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vworld-map")
    public ResponseEntity<String> getVWorldMap(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5.0") double radius) {
        
        // VWorld 지도 이미지 URL 생성
        String mapImageUrl = mapSearchService.generateVWorldMapUrl(lat, lon);
        
        // HTML 형태로 반환 (이미지 태그 포함)
        String htmlResponse = String.format(
            "<img src='%s' alt='지도' style='width:100%%; height:400px;'>",
            mapImageUrl
        );
        
        return ResponseEntity.ok()
            .header("Content-Type", "text/html")
            .body(htmlResponse);
    }

    @GetMapping("/naver-route")
    public ResponseEntity<String> getNaverRoute(
            @RequestParam double startLat,
            @RequestParam double startLon,
            @RequestParam double endLat,
            @RequestParam double endLon) {
        
        String routeUrl = mapSearchService.generateNaverRouteUrl(
            startLat, startLon, endLat, endLon
        );
        
        return ResponseEntity.ok(routeUrl);
    }
}
