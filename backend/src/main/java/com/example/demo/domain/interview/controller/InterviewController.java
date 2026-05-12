package com.example.demo.domain.interview.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.interview.dto.request.InterviewRequestDTO;
import com.example.demo.domain.interview.service.InterviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
public class InterviewController {
	
	private final InterviewService interviewService;
	
	// 인터뷰 신청
	@PostMapping
	public ResponseEntity<ApiResponse<?>> createInterview(@RequestBody InterviewRequestDTO request){
		
		int result = interviewService.createInterview(request);
		
		if(result > 0) {
			return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인터뷰 신청 완료", "success"));			
		} else {
			return ResponseEntity.ok(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "인터뷰 신청 실패"));	
		}
	}
	
	// 인터뷰 목록 조회
	@GetMapping
	public ResponseEntity<ApiResponse<?>> getInterviewList(@RequestParam Long userSq, @RequestParam String userType) {
	    return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인터뷰 목록 조회 성공", interviewService.getInterviewList(userSq, userType)));
	}
	
	// 인터뷰 상태 변경
	@PatchMapping
	public ResponseEntity<ApiResponse<?>> updateInterviewStatus(@RequestParam Long interviewSq,@RequestParam String interviewStatus) {

	    // A(수락), R(거절)만 허용
	    if (!interviewStatus.equals("A") && !interviewStatus.equals("R")) {
	        return ResponseEntity
	            .status(HttpStatus.BAD_REQUEST)
	            .body(ApiResponse.error(HttpStatus.BAD_REQUEST, "올바르지 않은 상태값입니다."));
	    }

	    return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인터뷰 상태 변경 완료",
	            interviewService.updateInterviewStatus(interviewSq, interviewStatus)));
	}
}
