package com.example.demo.domain.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.domain.project.vo.ProjectSummary;
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

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.project.dto.request.CompanyFilterRequest;
import com.example.demo.domain.project.dto.request.ProjectCreateRequest;
import com.example.demo.domain.project.dto.request.ProjectSearchRequest;
import com.example.demo.domain.project.dto.request.ScrapRequest;
import com.example.demo.domain.project.dto.response.AreaInfoResponse;
import com.example.demo.domain.project.dto.response.ProjectDetailResponse;
import com.example.demo.domain.project.dto.response.ProjectFormDataResponse;
import com.example.demo.domain.project.dto.response.ProjectListResponse;
import com.example.demo.domain.project.dto.response.ProjectRecruitStatus;
import com.example.demo.domain.project.service.ProjectService;

import com.example.demo.domain.user.util.JwtAuthenticationToken;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:8504")
public class ProjectController {
	private final ProjectService projectService;

	@PostMapping
	public ResponseEntity<ApiResponse<Void>> postProject(@Valid @RequestBody ProjectCreateRequest request,
			Authentication authentication) {
		JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
		projectService.createProject(request, token);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 생성 성공", null));
	}

	// TODO : 지원 및 스크랩 여부를 반환하는 API를 따로 만들어 그걸로 토큰을 받고, 여기선 토큰 제거.
	@GetMapping
	public ResponseEntity<ApiResponse<ProjectListResponse>> getProjectList(Authentication authentication,
			@ModelAttribute ProjectSearchRequest request) {
		// 인턴 추가 작업: 프로젝트 목록 조회 디버깅 로그 추가
		System.out.println("========== /api/projects API 호출 ==========");
		System.out.println("request: " + request);
		System.out.println("authentication: " + authentication);
		
		try {
			JwtAuthenticationToken token = null;
			if (authentication != null) {
				token = (JwtAuthenticationToken) authentication;
			}
			
			System.out.println("========== 서비스 호출 시작 ==========");
			ProjectListResponse response = projectService.fetchAllProject(token, request);
			System.out.println("========== 서비스 호출 성공 ==========");
			System.out.println("response: " + response);
			
			return ResponseEntity
					.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 목록 조회 성공", response));
		} catch (Exception e) {
			System.out.println("========== /api/projects 예외 발생 ==========");
			System.out.println("예외 타입: " + e.getClass().getName());
			System.out.println("예외 메시지: " + e.getMessage());
			e.printStackTrace();
			System.out.println("==========================================");
			throw e;
		}
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

	@PatchMapping
	public ResponseEntity<ApiResponse<Void>> patchProject(
			Authentication authentication,
			@RequestBody ProjectCreateRequest request) {
		projectService.updateProject(request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 수정 성공", null));
	}

	@DeleteMapping("/{projectSq}")
	public ResponseEntity<ApiResponse<Void>> deleteProject(
			Authentication authentication,
			@PathVariable("projectSq") Long projectSq) {
		projectService.softDeleteProject(projectSq);
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
		// 인턴 추가 작업: 프로젝트 상세 조회 디버깅 로그 추가
		System.out.println("========== /api/projects/" + projectSq + "/details API 호출 ==========");
		System.out.println("projectSq: " + projectSq);
		System.out.println("authentication: " + authentication);
		
		try {
			JwtAuthenticationToken token = null;
			if (authentication != null) {
				token = (JwtAuthenticationToken) authentication;
			}
			
			System.out.println("========== 서비스 호출 시작 ==========");
			ProjectDetailResponse response = projectService.fetchProject(projectSq, token);
			System.out.println("========== 서비스 호출 성공 ==========");
			System.out.println("response: " + response);
			
			return ResponseEntity
					.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 상세 내역 반환 성공", response));
		} catch (Exception e) {
			System.out.println("========== /api/projects/" + projectSq + "/details 예외 발생 ==========");
			System.out.println("예외 타입: " + e.getClass().getName());
			System.out.println("예외 메시지: " + e.getMessage());
			e.printStackTrace();
			System.out.println("==========================================");
			throw e;
		}
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

    // 프로젝트 유형별 최다 공고 조회
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<Map<String, List<ProjectSummary>>>> getPopularProjects() {
        Map<String, List<ProjectSummary>> result = new HashMap<>();

        // 올바른 Java 문법으로 메서드 호출
        result.put("viewCount", projectService.fetchPopularProjects("view_count"));
        result.put("scrapCount", projectService.fetchPopularProjects("scrap_count"));
        result.put("applicantCount", projectService.fetchPopularProjects("applicant_count"));

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인기 프로젝트 조회 성공", result));
    }

}
