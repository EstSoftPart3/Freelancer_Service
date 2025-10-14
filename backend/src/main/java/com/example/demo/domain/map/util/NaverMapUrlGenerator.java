package com.example.demo.domain.map.util;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class NaverMapUrlGenerator {
    
    // 네이버 지도 길찾기 기본 URL
    private static final String NAVER_MAP_BASE_URL = "https://map.naver.com/v5/directions";

    public String generateRouteUrl(double startLat, double startLon, 
                                  double endLat, double endLon) {
        
        return String.format(
            "%s/%s,%s,출발지/%s,%s,도착지",
            NAVER_MAP_BASE_URL,
            startLat, startLon,  // 출발지 좌표
            endLat, endLon       // 도착지 좌표
        );
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
