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
import com.example.demo.domain.project.dto.CorporateApplicantGroupDTO;
import com.example.demo.domain.project.dto.PersonalApplicantDTO;
import com.example.demo.domain.project.dto.request.ApplicationSqRequest;
import com.example.demo.domain.project.dto.request.ApplicationStatusRequest;
import com.example.demo.domain.project.dto.request.ProjectApplyRequest;
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

	@GetMapping("/corporate")
	public ResponseEntity<ApiResponse<Map<String, Object>>> getCorporateApplicationList(
			@AuthenticationPrincipal Long userSq,
			@RequestParam(defaultValue = "0") int offset,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "all") String searchType,
			@RequestParam(defaultValue = "") String keyword,
			@RequestParam(defaultValue = "all") String readType) {
		Map<String, Object> data = projectApplicationService.fetchCorporateProjectApplicationsWithCount(userSq, offset,
				size,
				searchType, keyword, readType);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기업별 프로젝트 지원 조회 성공", data));
	}

	@GetMapping("/interviews/{projectSq}")
	public ResponseEntity<ApiResponse<List<InterviewTimeInfoResponse>>> getAvailableInterviewTimes(
			@PathVariable("projectSq") Long projectSq) {
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "인터뷰 가능 시간 조회 성공", projectService.fetchProjectAvailableTimes(projectSq)));
	}

	@GetMapping("/{projectSq}/personal")
	public ResponseEntity<ApiResponse<PagedApplicantResponseDTO<PersonalApplicantDTO>>> getPersonalApplicants(
			@PathVariable Long projectSq,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "all") String filter,
			@RequestParam(defaultValue = "all") String searchType,
			@RequestParam(defaultValue = "") String keyword) {

		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 개인 지원자 현황 조회 성공",
						projectApplicationService.getPersonalApplicants(projectSq, page, size, filter, searchType, keyword)));
	}

	@GetMapping("/{projectSq}/corporate/grouped")
	public PagedApplicantResponseDTO<CorporateApplicantGroupDTO> getCorporateApplicantsGrouped(
			@PathVariable Long projectSq,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "all") String filter,
			@RequestParam(defaultValue = "all") String searchType,
			@RequestParam(defaultValue = "") String keyword) {

		return projectApplicationService.getCorporateApplicantsGrouped(projectSq, page, size, filter, searchType,
				keyword);
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
			@PathVariable("interviewTimeSq") Long interviewTimeSq, @RequestBody ApplicationSqRequest request, @AuthenticationPrincipal Long userSq) {
		projectApplicationService.updateInterviewTimeSelected(interviewTimeSq, request, userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인터뷰 시간 선택 성공", null));
	}

	@PostMapping("/{projectSq}")
	public ResponseEntity<ApiResponse<Void>> applyProject(@PathVariable("projectSq") Long projectSq,
			@RequestBody ProjectApplyRequest applyRequest, @AuthenticationPrincipal Long userSq) {
		projectService.createProjectApplication(projectSq, applyRequest, userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 지원 성공", null));
	}

	@GetMapping("/{projectSq}/check")
	public ResponseEntity<ApiResponse<Boolean>> checkIfApplied(
			@PathVariable Long projectSq,
			@RequestParam("userSq") Long userSq) {

		boolean hasApplied = projectApplicationService.checkIfUserApplied(userSq, projectSq);

		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "지원 여부 확인 성공", hasApplied));
	}

}
