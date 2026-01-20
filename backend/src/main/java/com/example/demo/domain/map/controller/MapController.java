package com.example.demo.domain.map.controller;

import java.util.List;

import org.springframework.boot.autoconfigure.graphql.data.GraphQlQueryByExampleAutoConfiguration;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.map.service.NaverMapService;
import com.example.demo.domain.project.service.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/map")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:8504")
public class MapController{
	private final NaverMapService naverMapService; 
	
	//프론트엔드 요청 예시 : /map/static?latitude=12.3456&longitude=34.5678
	@GetMapping("/static")
	public ResponseEntity<byte[]> getStaticMap(
			@RequestParam Double latitude, 
			@RequestParam Double longitude
			) {
			// 서비스에 요청
			byte[] imageBytes = naverMapService.getStaticMapImage(latitude, longitude); 
			
			//프론트에 보내기
			return ResponseEntity.ok()
					.contentType(MediaType.IMAGE_JPEG)
					.body(imageBytes); 
	}
	
	@GetMapping("/multi-static")
	public ResponseEntity<byte[]> getMultiMarkerMap(
			@RequestParam List<Double> latitudes, 
			@RequestParam List<Double> longitudes ) {
		byte[] imageBytes = naverMapService.getMultiMarkerMapImage(longitudes, latitudes); 
		
		return ResponseEntity.ok()
				.contentType(MediaType.IMAGE_JPEG)
				.body(imageBytes); 
	}
}