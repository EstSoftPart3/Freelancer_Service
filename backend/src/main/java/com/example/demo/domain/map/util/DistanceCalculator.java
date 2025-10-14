package com.example.demo.domain.map.util;

import org.springframework.stereotype.Component;

@Component
public class DistanceCalculator {
    
    // 지구 반지름 (km)
    private static final double EARTH_RADIUS = 6371;

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        
        // 1단계: 위도와 경도를 라디안으로 변환
        // 삼각함수는 라디안 단위로 계산해야 정확함
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);
        
        // 2단계: 위도와 경도의 차이 계산
        double deltaLat = lat2Rad - lat1Rad;  // 위도 차이
        double deltaLon = lon2Rad - lon1Rad;  // 경도 차이
        
        // 3단계: 하버사인 공식 적용
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // 4단계: 지구 반지름을 곱해서 실제 거리로 변환
        return EARTH_RADIUS * c;
    }

    // 거리를 소수점 둘째 자리까지 반올림
    public double roundDistance(double distance) {
        return Math.round(distance * 100.0) / 100.0;
    }
}
