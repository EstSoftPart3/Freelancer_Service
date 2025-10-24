package com.example.demo.domain.map.controller;

import com.example.demo.domain.map.dto.MapProjectDto;
import com.example.demo.domain.map.dto.request.MapSearchRequest;
import com.example.demo.domain.map.dto.response.MapSearchResponse;
import com.example.demo.domain.map.service.MapSearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;


@RestController
@RequestMapping("/map")
@CrossOrigin(origins = "*")
public class MapSearchController {
    
    private final MapSearchService mapSearchService;
    private final RestTemplate restTemplate;
    
    @Value("${naver.map.client-id}")
    private String naverClientId;
    
    @Value("${naver.map.client-secret}")
    private String naverClientSecret;

    public MapSearchController(MapSearchService mapSearchService) {
        this.mapSearchService = mapSearchService;
        this.restTemplate = new RestTemplate();
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


     // 네이버 지오코딩 API - 좌표를 주소로 변환
    @GetMapping("/naver/geocoding")
    public ResponseEntity<Map<String, Object>> getAddressFromCoordinates(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        
        try {
            System.out.println("=== 현재 위치 좌표 검증 ===");
            System.out.println("입력된 위도: " + latitude);
            System.out.println("입력된 경도: " + longitude);
            System.out.println("좌표 검증: 시청역 부근이면 37.5665, 126.9780 근처여야 함");
            System.out.println("=== 지오코딩 API 호출 시작 ===");
            
            // 네이버 지오코딩 API URL
            String geocodingUrl = String.format(
                "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=%.6f,%.6f&output=json&orders=legalcode,admcode",
                longitude, latitude
            );
            
            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-NCP-APIGW-API-KEY-ID", naverClientId);
            headers.set("X-NCP-APIGW-API-KEY", naverClientSecret);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 네이버 API 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                geocodingUrl,
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                System.out.println("=== 네이버 지오코딩 API 응답 분석 ===");
                System.out.println("API 응답 상태: " + response.getStatusCode());
                System.out.println("API 응답 전체: " + result);
                System.out.println("응답 키들: " + result.keySet());
                
                // results 배열 확인
                if (result.containsKey("results")) {
                    System.out.println("results 배열 존재: " + result.get("results"));
                } else {
                    System.out.println("❌ results 배열 없음!");
                }
                
                // 응답에서 주소 정보 추출
                Map<String, Object> addressInfo = extractAddressFromResponse(result);
                System.out.println("=== 최종 주소 추출 결과 ===");
                System.out.println("추출된 주소: " + addressInfo.get("address"));
                System.out.println("성공 여부: " + addressInfo.get("success"));
                System.out.println("출처: " + addressInfo.get("source"));
                System.out.println("=== 좌표와 주소 일치성 검증 ===");
                System.out.println("입력 좌표: " + latitude + ", " + longitude);
                System.out.println("변환된 주소: " + addressInfo.get("address"));
                
                return ResponseEntity.ok(addressInfo);
            } else {
                System.out.println("네이버 지오코딩 API 호출 실패");
                return createGeocodingFallbackResponse(latitude, longitude);
            }
            
        } catch (Exception e) {
            System.out.println("네이버 지오코딩 API 호출 중 오류: " + e.getMessage());
            e.printStackTrace();
            return createGeocodingFallbackResponse(latitude, longitude);
        }
    }

    // 네이버 지오코딩 응답에서 주소 정보 추출
    private Map<String, Object> extractAddressFromResponse(Map<String, Object> response) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("=== 주소 추출 디버깅 ===");
            System.out.println("응답에서 results 확인: " + response.get("results"));
            
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            System.out.println("results 리스트: " + results);
            
            if (results != null && !results.isEmpty()) {
                Map<String, Object> firstResult = results.get(0);
                System.out.println("첫 번째 결과: " + firstResult);
                
                Map<String, Object> region = (Map<String, Object>) firstResult.get("region");
                System.out.println("region 정보: " + region);
                
                if (region != null) {
                    // 주소 조합
                    StringBuilder addressBuilder = new StringBuilder();
                    
                    Map<String, Object> area1 = (Map<String, Object>) region.get("area1");
                    Map<String, Object> area2 = (Map<String, Object>) region.get("area2");
                    Map<String, Object> area3 = (Map<String, Object>) region.get("area3");
                    Map<String, Object> area4 = (Map<String, Object>) region.get("area4");
                    
                    System.out.println("=== 주소 구성 요소 분석 ===");
                    System.out.println("area1 (시/도): " + (area1 != null ? area1.get("name") : "null"));
                    System.out.println("area2 (시/군/구): " + (area2 != null ? area2.get("name") : "null"));
                    System.out.println("area3 (읍/면/동): " + (area3 != null ? area3.get("name") : "null"));
                    System.out.println("area4 (리): " + (area4 != null ? area4.get("name") : "null"));
                    
                    if (area1 != null) addressBuilder.append(area1.get("name")).append(" ");
                    if (area2 != null) addressBuilder.append(area2.get("name")).append(" ");
                    if (area3 != null) addressBuilder.append(area3.get("name")).append(" ");
                    if (area4 != null) addressBuilder.append(area4.get("name"));
                    
                    String fullAddress = addressBuilder.toString().trim();
                    
                    result.put("success", true);
                    result.put("address", fullAddress);
                    result.put("source", "naver");
                    
                    System.out.println("=== 최종 조합된 주소 ===");
                    System.out.println("완성된 주소: " + fullAddress);
                } else {
                    result.put("success", false);
                    result.put("address", "주소 정보를 찾을 수 없습니다");
                }
            } else {
                result.put("success", false);
                result.put("address", "주소 정보를 찾을 수 없습니다");
            }
        } catch (Exception e) {
            System.out.println("주소 추출 중 오류: " + e.getMessage());
            result.put("success", false);
            result.put("address", "주소 정보를 찾을 수 없습니다");
        }
        
        return result;
    }
    

    // 지오코딩 실패 시 대체 응답
    private ResponseEntity<Map<String, Object>> createGeocodingFallbackResponse(double latitude, double longitude) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("address", String.format("위도: %.4f, 경도: %.4f", latitude, longitude));
        response.put("source", "fallback");
        
        return ResponseEntity.ok(response);
    }

    // 주소를 좌표로 변환
    @PostMapping("/geocode")
    public ResponseEntity<Map<String, Object>> getCoordinates(@RequestBody Map<String, String> request) {
        
        String address = request.get("address");
        System.out.println("주소를 좌표로 변환 요청: " + address);
        
        // 주소 형식 정리
        String cleanAddress = address.replaceAll("\\s+", " ").trim();
        
        // 시/도 제거 (네이버 Geocoding API는 시/도 없는 형식 선호)
        cleanAddress = cleanAddress.replaceFirst("^(서울특별시|서울|부산광역시|부산|대구광역시|대구|인천광역시|인천|광주광역시|광주|대전광역시|대전|울산광역시|울산|세종특별자치시|세종|경기도|경기|강원특별자치도|강원도|강원|충청북도|충북|충청남도|충남|전라북도|전북|전북특별자치도|전라남도|전남|경상북도|경북|경상남도|경남|제주특별자치도|제주)\\s+", "");
        
        System.out.println("정리된 주소: " + cleanAddress);
        
           // 여러 형식 준비
           String[] testAddresses = {
               cleanAddress,
               cleanAddress.replaceAll(" ", ""),
               // 건물번호 제거 후 시도
               cleanAddress.replaceAll("\\s+\\d+$", ""),
               // 구/동만 추출
               cleanAddress.split("\\s+")[0] + " " + cleanAddress.split("\\s+")[1]
           };
        
        System.out.println("=== 주소 형식 순차 시도 시작 ===");
        
        try {
            // 여러 형식을 순차적으로 시도
            for (int i = 0; i < testAddresses.length; i++) {
                String testAddr = testAddresses[i];
                System.out.println("시도 " + (i+1) + "/" + testAddresses.length + ": " + testAddr);
                
                // 네이버 지오코딩 API URL
                String geocodingUrl = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=" + 
                    java.net.URLEncoder.encode(testAddr, "UTF-8");
                
                System.out.println("API URL: " + geocodingUrl);
                
                // HTTP 헤더 설정
                HttpHeaders headers = new HttpHeaders();
                headers.set("X-NCP-APIGW-API-KEY-ID", naverClientId);
                headers.set("X-NCP-APIGW-API-KEY", naverClientSecret);
                headers.set("Accept", "application/json");
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                // 네이버 API 호출
                ResponseEntity<Map> response = restTemplate.exchange(
                    geocodingUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
                );
                
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    Map<String, Object> result = response.getBody();
                    System.out.println("네이버 API 응답: " + result);
                    
                    // addresses 확인
                    List<Map<String, Object>> addresses = (List<Map<String, Object>>) result.get("addresses");
                    
                    // 결과가 있으면 성공
                    if (addresses != null && !addresses.isEmpty()) {
                        System.out.println("성공! 형식: " + testAddr);
                        Map<String, Object> coordsInfo = extractCoordsFromResponse(result, address);
                        System.out.println("추출된 좌표: " + coordsInfo);
                        return ResponseEntity.ok(coordsInfo);
                    } else {
                        System.out.println("결과 없음, 다음 형식 시도...");
                    }
                }
            }
            
            // 모든 형식 실패
            System.out.println("모든 주소 형식 시도 실패");
            return createCoordsFallbackResponse(address);
            
        } catch (Exception e) {
            System.out.println("주소 변환 중 오류: " + e.getMessage());
            e.printStackTrace();
            return createCoordsFallbackResponse(address);
        }
    }
    
    // 네이버 응답에서 좌표 추출
    private Map<String, Object> extractCoordsFromResponse(Map<String, Object> response, String address) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<Map<String, Object>> addresses = (List<Map<String, Object>>) response.get("addresses");
            
            if (addresses != null && !addresses.isEmpty()) {
                Map<String, Object> firstAddress = addresses.get(0);
                
                String x = (String) firstAddress.get("x");
                String y = (String) firstAddress.get("y");
                
                if (x != null && y != null) {
                    result.put("success", true);
                    result.put("latitude", Double.parseDouble(y));
                    result.put("longitude", Double.parseDouble(x));
                    result.put("address", address);
                } else {
                    result.put("success", false);
                    result.put("message", "좌표 정보를 찾을 수 없습니다");
                }
            } else {
                result.put("success", false);
                result.put("message", "주소를 찾을 수 없습니다");
            }
        } catch (Exception e) {
            System.out.println("좌표 추출 중 오류: " + e.getMessage());
            result.put("success", false);
            result.put("message", "좌표 추출 실패");
        }
        
        return result;
    }
    
    // 좌표 변환 실패 시 대체 응답
    private ResponseEntity<Map<String, Object>> createCoordsFallbackResponse(String address) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("latitude", 37.5665);
        response.put("longitude", 126.978);
        response.put("address", address);
        response.put("message", "좌표 변환 실패, 기본 좌표 사용");
        
        return ResponseEntity.ok(response);
    }
}
