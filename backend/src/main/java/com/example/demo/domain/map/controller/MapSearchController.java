package com.example.demo.domain.map.controller;

import com.example.demo.domain.map.dto.MapProjectDto;
import com.example.demo.domain.map.dto.request.MapSearchRequest;
import com.example.demo.domain.map.dto.response.MapSearchResponse;
import com.example.demo.domain.map.service.MapSearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/map")
@CrossOrigin(origins = "*")
public class MapSearchController {
    
    private final MapSearchService mapSearchService;
    
    @Value("${naver.map.client-id}")
    private String naverClientId;
    
    @Value("${naver.map.client-secret}")
    private String naverClientSecret;

    public MapSearchController(MapSearchService mapSearchService) {
        this.mapSearchService = mapSearchService;
    }

    @GetMapping("/user-address")
    public ResponseEntity<Map<String, Object>> getUserAddress(@RequestParam Long userId) {
        try {
            System.out.println("userId: " + userId);
            
            // 실제 사용자 주소 정보 조회
            MapProjectDto userLocation = mapSearchService.getUserLocation(userId);
            if (userLocation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            Map<String, Object> userAddress = new HashMap<>();
            userAddress.put("latitude", userLocation.getLatitude());
            userAddress.put("longitude", userLocation.getLongitude());
            userAddress.put("address", userLocation.getAddress());
            
            System.out.println("응답 데이터: " + userAddress);
            
            return ResponseEntity.ok(userAddress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<MapSearchResponse> searchProjectsSimple(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "5.0") double radius,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // 사용자 ID가 있으면 사용자 주소로 검색, 없으면 직접 좌표 사용
        MapSearchResponse response;
        if (userId != null) {
            response = mapSearchService.searchProjectsByUserId(userId, radius, jobType, keyword, page, size);
        } else if (lat != null && lon != null) {
            // 기존 방식 (직접 좌표 전달)
        MapSearchRequest request = MapSearchRequest.builder()
            .userLatitude(lat)
            .userLongitude(lon)
            .radius(radius)
            .jobType(jobType)
            .searchKeyword(keyword)
            .page(page)
            .size(size)
            .build();
            response = mapSearchService.searchProjects(request);
        } else {
            // 둘 다 없으면 에러
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(response);
    }


    @GetMapping("/naver-route")
    public ResponseEntity<String> getNaverRoute(
            @RequestParam double startLat,
            @RequestParam double startLon,
            @RequestParam double endLat,
            @RequestParam double endLon) {
        
        // 네이버 길찾기 URL 직접 생성
        String routeUrl = String.format(
            "https://map.naver.com/index.nhn?slng=%.6f&slat=%.6f&stext=출발지&elng=%.6f&elat=%.6f&etext=도착지&menu=route&pathType=1",
            startLon, startLat, endLon, endLat
        );
        
        return ResponseEntity.ok(routeUrl);
    }

    @GetMapping("/naver/static")
    public ResponseEntity<?> getNaverStaticMap(
            @RequestParam double centerLon,
            @RequestParam double centerLat,
            @RequestParam(defaultValue = "800") int width,
            @RequestParam(defaultValue = "500") int height,
            @RequestParam(defaultValue = "13") int level) {
        
        System.out.println("/naver/static API 호출");
        System.out.println("centerLon: " + centerLon);
        System.out.println("centerLat: " + centerLat);
        System.out.println("width: " + width);
        System.out.println("height: " + height);
        System.out.println("level: " + level);
        
        try {
            // 네이버 Static Map API URL 생성 (API 키를 URL 파라미터에 포함)
            String staticMapUrl = String.format(
                "https://maps.apigw.ntruss.com/map-static/v2/raster?w=%d&h=%d&center=%.6f,%.6f&level=%d&format=png&maptype=basic&X-NCP-APIGW-API-KEY-ID=%s",
                width, height, centerLon, centerLat, level, naverClientId
            );
            
            System.out.println("네이버 Static Map API URL: " + staticMapUrl);
            System.out.println("사용할 Client ID: " + naverClientId);
            System.out.println("사용할 Client Secret: " + naverClientSecret);
            
            // HTTP 클라이언트로 네이버 API 호출
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(staticMapUrl))
                .header("x-ncp-apigw-api-key-id", naverClientId)
                .header("x-ncp-apigw-api-key", naverClientSecret)
                .GET()
                .build();
            
            java.net.http.HttpResponse<byte[]> response = client.send(request, 
                java.net.http.HttpResponse.BodyHandlers.ofByteArray());
            
            System.out.println("네이버 API 응답 상태: " + response.statusCode());
            System.out.println("네이버 API 응답 헤더: " + response.headers().map());
            
            if (response.statusCode() == 200) {
                System.out.println("네이버 Static Map API 성공!");
                return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(response.body());
            } else {
                System.out.println("네이버 API 호출 실패: " + response.statusCode());
                // 에러 응답 본문
                String errorBody = new String(response.body());
                System.out.println("에러 응답 본문: " + errorBody);
                
                // 실패 시 응답 반환
                return createFallbackResponse(centerLon, centerLat);
            }
            
        } catch (Exception e) {
            System.out.println("네이버 Static Map API 호출 중 오류: " + e.getMessage());
            e.printStackTrace();
            // 오류 시 응답 반환
            return createFallbackResponse(centerLon, centerLat);
        }
    }
    
    private ResponseEntity<Map<String, Object>> createFallbackResponse(double centerLon, double centerLat) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "지도 서비스를 일시적으로 사용할 수 없습니다");
        response.put("location", Map.of("longitude", centerLon, "latitude", centerLat));
        response.put("fallback", true);
        
        return ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            .body(response);
    }
}
