package com.example.demo.domain.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.lang.model.type.NullType;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.viewcount.ViewCountDedupService;
import com.example.demo.domain.project.dto.ProjectRegionGroupDTO;
import com.example.demo.domain.project.dto.request.CompanyFilterRequest;
import com.example.demo.domain.project.dto.request.ProjectCreateRequest;
import com.example.demo.domain.project.dto.request.ProjectSearchRequest;
import com.example.demo.domain.project.dto.request.ScrapRequest;
import com.example.demo.domain.project.dto.response.AreaInfoResponse;
import com.example.demo.domain.project.dto.response.MainProjectResponse;
import com.example.demo.domain.project.dto.response.ProjectDetailResponse;
import com.example.demo.domain.project.dto.response.ProjectFormDataResponse;
import com.example.demo.domain.project.dto.response.ProjectListResponse;
import com.example.demo.domain.project.dto.response.ProjectRecruitStatus;
import com.example.demo.domain.project.service.ProjectService;

import com.example.demo.domain.user.util.JwtAuthenticationToken;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:8504")
public class ProjectController {
	private final ProjectService projectService;
	private final ViewCountDedupService viewCountDedupService;

	@PostMapping
	public ResponseEntity<ApiResponse<Void>> postProject(@Valid @RequestBody ProjectCreateRequest request,
			Authentication authentication) {
		JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
		projectService.createProject(request, token);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 생성 성공", null));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<ProjectListResponse>> getProjectList(Authentication authentication,
			@ModelAttribute ProjectSearchRequest request) {
		JwtAuthenticationToken token = null;
		if (authentication != null) {
			token = (JwtAuthenticationToken) authentication;
		}
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 목록 조회 성공", projectService.fetchAllProject(token, request)));
	}

	@GetMapping("/companies")
	public ResponseEntity<ApiResponse<ProjectListResponse>> getCompanyProjectList(
			@ModelAttribute CompanyFilterRequest request, Authentication authentication) {
		JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "기업 프로젝트 목록 조회 성공", projectService.fetchCompanyProject(request, token)));
	}

	@GetMapping("/companies/status")
	public ResponseEntity<ApiResponse<ProjectRecruitStatus>> getCompanyProjectStatusList(
			@ModelAttribute CompanyFilterRequest request, Authentication authentication) {
		JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기업 프로젝트 상태 조회 성공",
				projectService.fetchCompanyProjectCount(request, token)));
	}

	// @Valid가 빠져 있어 수정 시에는 필수값·날짜 정합성이 전혀 검증되지 않았다.
	// 등록과 같은 DTO·같은 payload를 쓰므로 붙여도 기존 흐름이 깨지지 않는다.
	@PatchMapping
	public ResponseEntity<ApiResponse<Void>> patchProject(
			Authentication authentication,
			@Valid @RequestBody ProjectCreateRequest request) {
		projectService.updateProject(request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 수정 성공", null));
	}

	@DeleteMapping("/{projectSq}")
	public ResponseEntity<ApiResponse<Void>> deleteProject(
			Authentication authentication, // 또는 @AuthenticationPrincipal JwtAuthenticationToken token
			@PathVariable("projectSq") Long projectSq) {

		// Authentication을 JwtAuthenticationToken으로 캐스팅해서 전달
		JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;

		projectService.softDeleteProject(projectSq, token);

		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 삭제 성공", null));
	}

	@PostMapping("/{projectSq}/scraps")
	public ResponseEntity<ApiResponse<Long>> scrapProject(@PathVariable("projectSq") Long projectSq,
			@RequestBody ScrapRequest scrapRequest, @AuthenticationPrincipal Long userSq) {
		projectService.toggleProjectScrap(projectSq, scrapRequest, userSq);
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 스크랩 토글 성공", projectService.fetchScrapCount(projectSq)));
	}

	// TODO : 지원 및 스크랩 여부를 반환하는 API를 따로 만들어 그걸로 토큰을 받고, 여기선 토큰 제거.
	@GetMapping("/{projectSq}/details")
	public ResponseEntity<ApiResponse<ProjectDetailResponse>> getProjectDetails(
			@PathVariable("projectSq") Long projectSq, Authentication authentication) {
		JwtAuthenticationToken token = null;
		if (authentication != null) {
			token = (JwtAuthenticationToken) authentication;
		}
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 상세 내역 반환 성공", projectService.fetchProject(projectSq, token)));
	}

	// 프로젝트 조회수 증가 (BoardController.addViewCntBoard와 동일 패턴 — 상세 GET에서 분리)
	@PatchMapping("/{projectSq}/increment-view")
	public ResponseEntity<ApiResponse<NullType>> addViewCntProject(
			@AuthenticationPrincipal Long userSq,
			@PathVariable("projectSq") Long projectSq,
			HttpServletRequest request) {
		if (viewCountDedupService.isFirstView("project", projectSq, userSq, request)) {
			projectService.addViewCntProject(projectSq);
		}
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가가 완료되었습니다.", null));
	}

	@GetMapping("/forms")
	public ResponseEntity<ApiResponse<ProjectFormDataResponse>> getProjectFormDatas(
			@RequestParam(value = "projectSq", defaultValue = "0") Long projectSq) {

		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 폼 데이터 반환 성공", projectService.fetchProjectFormDatas(projectSq)));
	}

	@GetMapping("/{areaCodeSq}/districts")
	public ResponseEntity<ApiResponse<List<AreaInfoResponse>>> getDistrictInfos(
			@PathVariable("areaCodeSq") Long areaCodeSq) {
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "하위 행정구역 반환 성공", projectService.fetchDistricts(areaCodeSq)));
	}

	@GetMapping("/filters")
	public ResponseEntity<ApiResponse<List<?>>> getSearchFilterInfos(@RequestParam("type") String type) {
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 필터 내용 반환 성공", projectService.fetchFilterInfos(type)));
	}

	@GetMapping("/popular")
	public ResponseEntity<List<MainProjectResponse>> getPopularProjects(
			@RequestParam(defaultValue = "views") String sortType) {
		return ResponseEntity.ok(projectService.fetchMainPopularProjects(sortType));
	}

	@GetMapping("/regions")
	public ResponseEntity<ApiResponse<List<ProjectRegionGroupDTO>>> getProjectRegionGroups(
			@ModelAttribute ProjectSearchRequest request) {

		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "지역별 프로젝트 그룹 조회 성공",
						projectService.fetchProjectRegionGroups(request)));
	}
}
