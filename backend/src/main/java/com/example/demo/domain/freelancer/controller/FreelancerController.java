package com.example.demo.domain.freelancer.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.freelancer.dto.request.FreelancerRequestDTO;
import com.example.demo.domain.freelancer.dto.request.FreelancerSearchRequestDTO;
import com.example.demo.domain.freelancer.dto.response.FreelancerResponseDTO;
import com.example.demo.domain.freelancer.service.FreelancerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/freelancer")
@RequiredArgsConstructor
public class FreelancerController {
	
	private final FreelancerService freelancerService;
	
	// 프리랜서 등록
	@PostMapping()
	public ResponseEntity<ApiResponse<?>> createFreelancer(
	    @RequestPart FreelancerRequestDTO request,
	    @RequestPart(required = false) MultipartFile profileImage) {
	    
	    int result = freelancerService.createFreelancer(request, profileImage);
	    
	    if(result > 0) {
	    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프리랜서 등록 완료", "success"));
	    } else {
	    	return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "프리랜서 등록 실패"));
	    }
	    
	}
	
	// 프리랜서 전체 조회
	@GetMapping("/all")
	public ResponseEntity<ApiResponse<?>> getFreelancerAll(){
		List<FreelancerResponseDTO> result = freelancerService.getFreelancerAll();
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로랜서 전체 조회 성공",result));
	}
	
	// 프리랜서 검색 조회
	@GetMapping("/search")
	public ResponseEntity<ApiResponse<?>> getFreelancerSearch(@ModelAttribute FreelancerSearchRequestDTO request) {
	    List<FreelancerResponseDTO> result = freelancerService.getFreelancerSearch(request);
	    return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로랜서 검색 성공",result));
	}

}
