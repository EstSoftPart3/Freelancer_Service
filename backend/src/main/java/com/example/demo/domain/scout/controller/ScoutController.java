package com.example.demo.domain.scout.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.scout.dto.request.ScoutListRequestDto;
import com.example.demo.domain.scout.dto.request.ScoutRequestDto;
import com.example.demo.domain.scout.dto.request.ScoutStatusUpdateRequestDto;
import com.example.demo.domain.scout.dto.response.ScoutDetailResponse;
import com.example.demo.domain.scout.dto.response.ScoutListResponseDto;
import com.example.demo.domain.scout.dto.response.ScoutResponseDto;
import com.example.demo.domain.scout.service.ScoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/scouts")
@RequiredArgsConstructor
public class ScoutController {
	
	private final ScoutService scoutService;
	
	@PostMapping
	public ResponseEntity<Map<String, Object>> createScout(@RequestBody ScoutRequestDto scoutRequestDto){
		Long currentCompanySqLong = 145L;
		
		ScoutResponseDto responseDto = scoutService.createScoutOffer(currentCompanySqLong, scoutRequestDto);
		
		Map<String, Object> response = new HashMap<>();
		response.put("data", responseDto);
		
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/my")
    public ResponseEntity<ScoutListResponseDto> getMyScoutList(
            ScoutListRequestDto requestDto,
            @AuthenticationPrincipal Long userSq
    ) {
        ScoutListResponseDto response = scoutService.getScoutList(requestDto, userSq);
        return ResponseEntity.ok(response);
	}
	
	@GetMapping("/{scoutSq}")
	public ResponseEntity<ScoutDetailResponse> getScoutDetail(
	        @PathVariable("scoutSq") Long scoutSq) {
	    ScoutDetailResponse response = scoutService.getScoutDetail(scoutSq);
	    return ResponseEntity.ok(response);
	}

	@PatchMapping("/{scoutSq}/status")
	public ResponseEntity<Void> updateScoutStatus(
	        @PathVariable("scoutSq") Long scoutSq,
	        @RequestBody ScoutStatusUpdateRequestDto request) {
	    scoutService.updateStatus(scoutSq, request);
	    return ResponseEntity.ok().build();
	}

	@PatchMapping("/{scoutSq}/reject")
	public ResponseEntity<Void> rejectScout(
	        @PathVariable("scoutSq") Long scoutSq,
	        @RequestBody ScoutStatusUpdateRequestDto request) {
	    request.setStatus("REJECTED");
	    scoutService.updateStatus(scoutSq, request);
	    return ResponseEntity.ok().build();
	}

	
}
