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
            System.out.println("========== /user-address API 호출 ==========");
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
            System.out.println("==========================================");
            
            return ResponseEntity.ok(userAddress);
        } catch (Exception e) {
            System.out.println("========== /user-address API 에러 ==========");
            e.printStackTrace();
            System.out.println("==========================================");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/search")
    public ResponseEntity<MapSearchResponse> searchProjects(
            @Valid @RequestBody MapSearchRequest request) {

        
        MapSearchResponse response = mapSearchService.searchProjects(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<MapSearchResponse> searchProjectsSimple(
            @RequestParam(required = false) Long userId,           // 사용자 ID (우선 사용)
            @RequestParam(required = false) Double lat,            // 사용자 위도 (fallback)
            @RequestParam(required = false) Double lon,            // 사용자 경도 (fallback)
            @RequestParam(defaultValue = "5.0") double radius,     // 반경 (기본값 5km)
            @RequestParam(required = false) String jobType,        // 직무
            @RequestParam(required = false) String keyword,        // 검색어
            @RequestParam(defaultValue = "0") int page,            // 페이지 (기본값 0)
            @RequestParam(defaultValue = "20") int size) {         // 개수 (기본값 20)
        
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
    public ResponseEntity<byte[]> getNaverStaticMap(
            @RequestParam double centerLon,
            @RequestParam double centerLat,
            @RequestParam(defaultValue = "800") int width,
            @RequestParam(defaultValue = "500") int height,
            @RequestParam(defaultValue = "13") int level) {
        
        System.out.println("========== /naver/static API 호출 ==========");
        System.out.println("centerLon: " + centerLon);
        System.out.println("centerLat: " + centerLat);
        System.out.println("width: " + width);
        System.out.println("height: " + height);
        System.out.println("level: " + level);
        
        try {
            // 네이버 Static Map API URL 생성 (정확한 엔드포인트 사용)
            String staticMapUrl = String.format(
                "https://maps.apigw.ntruss.com/map-static/v2/raster?w=%d&h=%d&center=%.6f,%.6f&level=%d&format=png&maptype=basic",
                width, height, centerLon, centerLat, level
            );
            
            System.out.println("네이버 Static Map API URL: " + staticMapUrl);
            System.out.println("사용할 Client ID: " + naverClientId);
            System.out.println("사용할 Client Secret: " + naverClientSecret);
            
            // HTTP 클라이언트로 네이버 API 호출
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(staticMapUrl))
                .header("X-NCP-APIGW-API-KEY-ID", naverClientId)
                .header("X-NCP-APIGW-API-KEY", naverClientSecret)
                .GET()
                .build();
            
            java.net.http.HttpResponse<byte[]> response = client.send(request, 
                java.net.http.HttpResponse.BodyHandlers.ofByteArray());
            
            System.out.println("네이버 API 응답 상태: " + response.statusCode());
            System.out.println("네이버 API 응답 헤더: " + response.headers().map());
            
            if (response.statusCode() == 200) {
                System.out.println("✅ 네이버 Static Map API 성공!");
                return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(response.body());
            } else {
                System.out.println("❌ 네이버 API 호출 실패: " + response.statusCode());
                // 에러 응답 본문도 출력
                String errorBody = new String(response.body());
                System.out.println("에러 응답 본문: " + errorBody);
                
                // 실패 시 기본 지도 이미지 반환
                return createFallbackMapImage(width, height, centerLon, centerLat);
            }
            
        } catch (Exception e) {
            System.out.println("네이버 Static Map API 호출 중 오류: " + e.getMessage());
            e.printStackTrace();
            // 오류 시 기본 지도 이미지 반환
            return createFallbackMapImage(width, height, centerLon, centerLat);
        }
    }
    
    private ResponseEntity<byte[]> createFallbackMapImage(int width, int height, double centerLon, double centerLat) {
        // 기본 지도 이미지 SVG 생성
        String svgContent = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<rect width=\"100%%\" height=\"100%%\" fill=\"#e9ecef\"/>" +
            "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"20\" fill=\"#007bff\" text-anchor=\"middle\">🗺️ 지도</text>" +
            "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"14\" fill=\"#6c757d\" text-anchor=\"middle\">📍 위치: %.6f, %.6f</text>" +
            "<circle cx=\"%d\" cy=\"%d\" r=\"8\" fill=\"#007bff\" stroke=\"white\" stroke-width=\"2\"/>" +
            "</svg>",
            width, height,
            width/2, height/2 - 20,
            width/2, height/2 + 10, centerLon, centerLat,
            width/2, height/2 + 30
        );
        
        byte[] svgBytes = svgContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.valueOf("image/svg+xml"))
            .body(svgBytes);
    }
}
