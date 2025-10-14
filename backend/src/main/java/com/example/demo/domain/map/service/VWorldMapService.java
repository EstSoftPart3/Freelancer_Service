package com.example.demo.domain.map.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;


@Service
public class VWorldMapService {
    
    // VWorld API 기본 URL
    private static final String VWORLD_API_KEY = "{app-key}";
    private static final String VWORLD_MAP_URL = "https://api.vworld.kr/req/wms";
    

    public String generateStaticMapUrl(BigDecimal latitude, BigDecimal longitude, 
                                       int width, int height, int zoom) {
        
        // BBOX 계산: 중심점 기준으로 지도 범위 설정
        // 0.01도 = 약 1km 정도 (서울 기준)
        BigDecimal lonMin = longitude.subtract(BigDecimal.valueOf(0.01));
        BigDecimal latMin = latitude.subtract(BigDecimal.valueOf(0.01));
        BigDecimal lonMax = longitude.add(BigDecimal.valueOf(0.01));
        BigDecimal latMax = latitude.add(BigDecimal.valueOf(0.01));
        
        return String.format(
            "%s?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap" +
            "&LAYERS=lt_c_adsido_info,lt_c_adsigg_info" + // 행정구역 레이어
            "&STYLES=&CRS=EPSG:4326" +
            "&BBOX=%s,%s,%s,%s" + // 지도 범위
            "&WIDTH=%d&HEIGHT=%d" +
            "&FORMAT=image/png" +
            "&TRANSPARENT=false" +
            "&BGCOLOR=0xFFFFFF" +
            "&KEY=%s",
            VWORLD_MAP_URL,
            lonMin, latMin, lonMax, latMax,  // BBOX (경도min,위도min,경도max,위도max)
            width, height,
            VWORLD_API_KEY
        );
    }

    public String generateStaticMapUrl(BigDecimal latitude, BigDecimal longitude) {
        return generateStaticMapUrl(latitude, longitude, 800, 600, 15);
    }

    public String generateMapHtml(BigDecimal latitude, BigDecimal longitude) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <script type="text/javascript" 
                    src="https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=%s">
                </script>
            </head>
            <body>
                <div id="vmap" style="width:100%%; height:400px;"></div>
                <script type="text/javascript">
                    var vmap = new vw.Map("vmap", {
                        basemapType: vw.BasemapType.GRAPHIC,
                        center: [%s, %s], // [경도, 위도]
                        zoom: 15
                    });
                    
                    // 마커 추가
                    var marker = new vw.Marker([%s, %s], {
                        icon: vw.MarkerIcon.RED
                    });
                    vmap.addOverlay(marker);
                </script>
            </body>
            </html>
            """, 
            VWORLD_API_KEY, 
            longitude, latitude,  // 지도 중심점
            longitude, latitude   // 마커 위치
        );
    }
}
