package com.example.demo.domain.map.util;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

@Component
public class NaverMapUrlGenerator {
    
    // 네이버 지도 길찾기 기본 URL (최근 v5 → p로 변경됨)
    private static final String NAVER_MAP_BASE_URL = "https://map.naver.com/p/directions";
    
    /**
     * WGS84 좌표(위도/경도)를 EPSG:3857 좌표(평면 좌표)로 변환
     * 네이버 지도는 EPSG:3857 좌표계(Web Mercator)를 사용합니다.
     * 
     * @param lat 위도 (WGS84)
     * @param lon 경도 (WGS84)
     * @return [x, y] EPSG:3857 좌표 (미터 단위)
     */
    private static double[] wgs84ToEpsg3857(double lat, double lon) {
        // 경도 변환: -180 ~ 180도를 미터 단위로 변환
        double x = lon * 20037508.34 / 180.0;
        
        // 위도 변환: 메르카토르 투영법 적용
        // 지구가 둥글기 때문에 복잡한 계산 필요
        double y = Math.log(Math.tan((90.0 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0);
        y = y * 20037508.34 / 180.0;
        
        return new double[]{x, y};
    }

    public String generateRouteUrl(double startLat, double startLon, 
                                  double endLat, double endLon,
                                  String startAddress, String endAddress) {
        
        // WGS84 → EPSG:3857 좌표 변환
        double[] startCoords = wgs84ToEpsg3857(startLat, startLon);
        double[] endCoords = wgs84ToEpsg3857(endLat, endLon);
        
        try {
            // 네이버 지도 형식: x좌표,y좌표,라벨,ID,타입
            // 실제 주소 정보 사용 (+ 기호 대신 %20 사용)
            String startLabel = URLEncoder.encode(startAddress != null ? startAddress : "내위치", "UTF-8").replace("+", "%20");
            String endLabel = URLEncoder.encode(endAddress != null ? endAddress : "프로젝트위치", "UTF-8").replace("+", "%20");
            
            // ID는 빈 문자열로 설정 (장소 ID 없음)
            return String.format(
                "%s/%.7f,%.7f,%s,,PLACE_POI/%.7f,%.7f,%s,,PLACE_POI/-/transit?c=15.00,0,0,0,dh",
                NAVER_MAP_BASE_URL,
                startCoords[0], startCoords[1], startLabel,
                endCoords[0], endCoords[1], endLabel
            );
        } catch (UnsupportedEncodingException e) {
            // UTF-8은 항상 지원되므로 발생 안 함
            return String.format(
                "%s/%.7f,%.7f,%s,,PLACE_POI/%.7f,%.7f,%s,,PLACE_POI/-/transit?c=15.00,0,0,0,dh",
                NAVER_MAP_BASE_URL,
                startCoords[0], startCoords[1], startAddress != null ? startAddress : "내위치",
                endCoords[0], endCoords[1], endAddress != null ? endAddress : "프로젝트위치"
            );
        }
    }

    // 기존 함수는 호환성을 위해 유지 (하드코딩된 라벨 사용)
    public String generateRouteUrl(double startLat, double startLon, 
                                  double endLat, double endLon) {
        
        return generateRouteUrl(startLat, startLon, endLat, endLon, null, null);
    }

    public String generateRouteUrl(BigDecimal startLat, BigDecimal startLon,
                                  BigDecimal endLat, BigDecimal endLon) {
        
        return generateRouteUrl(
            startLat.doubleValue(),
            startLon.doubleValue(),
            endLat.doubleValue(),
            endLon.doubleValue()
        );
    }

    public String generateLocationUrl(double latitude, double longitude, String label) {
        
        return String.format(
            "https://map.naver.com/v5/search/%s/%s,%s",
            label,
            latitude, longitude
        );
    }
}
