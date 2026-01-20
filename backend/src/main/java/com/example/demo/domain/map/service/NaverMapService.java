package com.example.demo.domain.map.service;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Value; 
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NaverMapService {
	private final RestTemplate restTemplate; 
	
	@Value("${naver.map.url}")
	private String mapUrl; 
	
	@Value("${naver.map.client-id}")
	private String clientId; 
	
	@Value("${naver.map.client-secret}")
	private String clientSecret; 
	
	//지도 이미지 변환 코드
	public byte[] getStaticMapImage(Double latitude, Double longitude) {
		
		// [디버깅 코드]
//	    System.out.println("========== 네이버 키 확인 ==========");
//	    System.out.println("Client ID: " + clientId);
//	    System.out.println("Client Secret: " + (clientSecret != null ? "value exists(hidden)" : "NULL입니다!"));
//	    System.out.println("==================================");
			    
	    // 헤더
		HttpHeaders headers = new HttpHeaders();
		headers.set("x-ncp-apigw-api-key-id",clientId); 
		headers.set("x-ncp-apigw-api-key",clientSecret); 
	
		//헤더 엔티티
		HttpEntity<String> entity = new HttpEntity<>(headers);
		
		//요청 URL 만들기(쿼리 파라미터 조립)
		URI uri = UriComponentsBuilder.fromHttpUrl(mapUrl)
				.queryParam("w", 500)
				.queryParam("h", 500)
				.queryParam("center", longitude+","+latitude)
				.queryParam("level", 14)
				.queryParam("markers", "type:d|pos:"+longitude+" "+latitude)
				.build()
				.toUri();
		
		System.out.println(">>> 네이버 지도 요청 URL: " + uri.toString()); //로그 확인용
		
		//외부 요청 보내기 
		try {
			ResponseEntity<byte[]> responseEntity = restTemplate.exchange(
					uri, 
					HttpMethod.GET, 
					entity, 
					byte[].class); 
			return responseEntity.getBody(); 			
		} catch (Exception e) {
			System.out.println("네이버 지도 요청 실패"); 
			System.out.println("error message:"+e.getMessage()); 
			e.printStackTrace(); 
			throw new RuntimeException("네이버 지도 요청 실패",e); 
		}
	}
	
	public byte[] getMultiMarkerMapImage(List<Double> longitudes, List<Double> latitudes ) {
		//유효성 검사
		if(longitudes == null || latitudes == null || longitudes.size()!=longitudes.size()) {
			throw new IllegalArgumentException("longitudes latitudes list wrong");
		}
		//마커 문자열
		//목표 포맷: "type:d|pos:127.1 37.1, 127.2 37.2..."
		StringBuilder markerStr = new StringBuilder(); 
		markerStr.append("type:d|pos:"); 
		
		//리스트를 돌면서 좌표 추가
		for (int i = 0; i<latitudes.size(); i++) {
			Double longitude = longitudes.get(i);
			Double latitude = latitudes.get(i);
			markerStr.append(longitude).append(" ").append(latitude).append(","); 
		}
		
		//헤더
		HttpHeaders headers = new HttpHeaders();
		headers.set("x-ncp-apigw-api-key-id",clientId); 
		headers.set("x-ncp-apigw-api-key",clientSecret); 
		HttpEntity<String> entity = new HttpEntity<>(headers);
		
		// 5. URI 생성
        URI uri = UriComponentsBuilder.fromHttpUrl(mapUrl)
                .queryParam("w", 500)
                .queryParam("h", 500)
                .queryParam("markers", markerStr.toString()) // ★ 만든 마커 문자열 넣기
                .build()
                .toUri();
        
        System.out.println(">>> 네이버 지도 요청 URL: " + uri.toString()); //로그 확인용
        
        try {
			ResponseEntity<byte[]> responseEntity = restTemplate.exchange(
					uri, 
					HttpMethod.GET, 
					entity, 
					byte[].class); 
			return responseEntity.getBody(); 			
		} catch (Exception e) {
			System.out.println("MultiMarker Map Request Failed"); 
			System.out.println("error message:"+e.getMessage()); 
			e.printStackTrace(); 
			throw new RuntimeException("MultiMarker Map Request Failed",e); 
		}
	}
	
}