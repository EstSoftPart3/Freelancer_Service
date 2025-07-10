package com.example.demo.domain.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.project.dto.CorporateApplicantDTO;
import com.example.demo.domain.project.dto.PersonalApplicantDTO;
import com.example.demo.domain.project.dto.request.ApplicationSqRequest;
import com.example.demo.domain.project.dto.request.ApplicationStatusRequest;
import com.example.demo.domain.project.dto.request.ProjectApplyRequest;
import com.example.demo.domain.project.dto.response.ApplicationStatusList;
import com.example.demo.domain.project.dto.response.InterviewTimeInfoResponse;
import com.example.demo.domain.project.dto.response.PagedApplicantResponseDTO;
import com.example.demo.domain.project.service.ProjectApplicationService;
import com.example.demo.domain.project.service.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects/applications")
@RequiredArgsConstructor
public class ProjectApplicationController {

	private final ProjectApplicationService projectApplicationService;
	private final ProjectService projectService;

	@GetMapping
	public ResponseEntity<ApiResponse<Map<String, Object>>> getApplicationList(
			@AuthenticationPrincipal Long userSq,
			@RequestParam(defaultValue = "0") int offset,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "all") String searchType,
			@RequestParam(defaultValue = "") String keyword,
			@RequestParam(defaultValue = "all") String readType) {
		Map<String, Object> data = projectApplicationService.fetchProjectApplicationsWithCount(userSq, offset, size,
				searchType, keyword, readType);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 지원 조회 성공", data));
	}

	@GetMapping("/interviews/{projectSq}")
	public ResponseEntity<ApiResponse<List<InterviewTimeInfoResponse>>> getAvailableInterviewTimes(
			@PathVariable("projectSq") Long projectSq) {
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "인터뷰 가능 시간 조회 성공", projectService.fetchProjectAvailableTimes(projectSq)));
	}

	// 개인 지원자 목록 조회 (페이징)
	@GetMapping("/{projectSq}/personal")
	public PagedApplicantResponseDTO<PersonalApplicantDTO> getPersonalApplicants(
			@PathVariable Long projectSq,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "5") int size) {

		return projectApplicationService.getPersonalApplicants(projectSq, page, size);
	}

	// 기업 지원자 목록 조회 (페이징)
	@GetMapping("/{projectSq}/corporate")
	public PagedApplicantResponseDTO<CorporateApplicantDTO> getCorporateApplicants(
			@PathVariable Long projectSq,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "5") int size) {

		return projectApplicationService.getCorporateApplicants(projectSq, page, size);
	}

	@PatchMapping("/{applicationSq}")
	public ResponseEntity<ApiResponse<Void>> patchApplicationStatus(
			Authentication authentication,
			@PathVariable("applicationSq") Long applicationSq,
			@RequestBody ApplicationStatusRequest request) {
		projectApplicationService.updateApplicantResult(request, applicationSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 지원 상태 변경 성공", null));
	}

	@PatchMapping("/interviews/{interviewTimeSq}")
	public ResponseEntity<ApiResponse<Void>> patchApplicationStatus(
			@PathVariable("interviewTimeSq") Long interviewTimeSq, @RequestBody ApplicationSqRequest request) {
		projectApplicationService.updateInterviewTimeSelected(interviewTimeSq, request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인터뷰 시간 선택 성공", null));
	}

	@PostMapping("/{projectSq}")
	public ResponseEntity<ApiResponse<Void>> applyProject(@PathVariable("projectSq") Long projectSq,
			@RequestBody ProjectApplyRequest applyRequest, @AuthenticationPrincipal Long userSq) {
		projectService.createProjectApplication(projectSq, applyRequest, userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 지원 성공", null));
	}

}
