package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.response.AdminFreelancerProposalResponseDTO;
import com.example.demo.domain.admin.service.AdminFreelancerProposalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/freelancers")
@RequiredArgsConstructor
public class AdminFreelancerProposalController {
	
	private final AdminFreelancerProposalService service;
	
	@GetMapping("/proposals")
	public ResponseEntity<ApiResponse<?>> getAllProposals(){
		List<AdminFreelancerProposalResponseDTO> proposals =
				service.getAllProposal();
		return ResponseEntity.ok(
			ApiResponse.of(HttpStatus.OK, "프리랜서 제안 목록 조회 성공", proposals)
		);
	}
}
