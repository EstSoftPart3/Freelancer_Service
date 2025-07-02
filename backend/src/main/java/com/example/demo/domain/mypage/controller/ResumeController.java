package com.example.demo.domain.mypage.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.mypage.dto.ParentSkillTagDTO;
import com.example.demo.domain.mypage.dto.RepResumeSwitchRequest;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.dto.response.CertificateListResponseDTO;
import com.example.demo.domain.mypage.dto.response.ProjectHistoryTypeCodeGroupResponseDTO;
import com.example.demo.domain.mypage.dto.response.ResumeListResponse;
import com.example.demo.domain.mypage.service.ResumeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/mypage/resume")
@RequiredArgsConstructor

public class ResumeController {

	private final ResumeService resumeService;

	// 이력서 생성 (등록)
	@PostMapping
	public ResponseEntity<ApiResponse<?>> createResume(
			@AuthenticationPrincipal Long userSq,
			@RequestPart ResumeRequestDTO dto,
			@RequestPart(required = false) List<MultipartFile> profileImages,
			@RequestPart(required = false) List<MultipartFile> attachments) {

		int result = resumeService.createResume(userSq, dto, profileImages, attachments);

		if (result > 0) {
			return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 등록 완료", "success"));
		} else {
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "이력서 등록 실패", "fail"));
		}
	}

	// 이력서 수정
	@PutMapping("/{resumeSq}")
	public ResponseEntity<ApiResponse<String>> updateResume(
			@PathVariable Long resumeSq,
			@AuthenticationPrincipal Long userSq,
			@RequestPart ResumeRequestDTO dto,
			@RequestPart(required = false) List<MultipartFile> profileImages,
			@RequestPart(required = false) List<MultipartFile> attachments) {

		dto.setResumeSq(resumeSq); // 경로 변수로 받은 이력서 번호 설정

		int result = resumeService.updateResume(userSq, dto, profileImages, attachments);
		if (result > 0) {
			return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 수정 완료", "success"));
		} else {
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "이력서 수정 실패", "fail"));
		}
	}

	// 수정용 이력서 상세 조회
	@GetMapping("/{resumeSq}")
	public ResponseEntity<ApiResponse<ResumeRequestDTO>> getResumeDetail(@PathVariable Long resumeSq) {
		ResumeRequestDTO resume = resumeService.getResumeDetail(resumeSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 조회 완료", resume));
	}

	@GetMapping("/project-history/parent-skill")
	public ResponseEntity<ApiResponse<List<ParentSkillTagDTO>>> getParentSkillTags() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "부모 스킬 태그 조회 완료", resumeService.getParentSkillTags()));
	}

	// 대표 이력서 설정
	@PatchMapping("/representative/{resumeSq}")
	public ResponseEntity<ApiResponse<String>> setMainResume(@AuthenticationPrincipal Long userSq,
			@PathVariable("resumeSq") Long resumeSq,
			@RequestBody(required = false) RepResumeSwitchRequest request) {
		Long memberSq = (request != null && request.getMemberSq() != null)
				? request.getMemberSq()
				: userSq;

		resumeService.setMainResume(resumeSq, memberSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "대표 이력서 설정 완료", "success"));
	}

	@PatchMapping("/representative/{resumeSq}/others")
	public ResponseEntity<ApiResponse<String>> setMainResume(@AuthenticationPrincipal Long userSq,
			@PathVariable("resumeSq") Long resumeSq) {
		resumeService.setOthersMainResume(resumeSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 인원 대표 이력서 설정 완료", "success"));
	}

	@GetMapping("/list")
	public ResponseEntity<ApiResponse<Map<String, Object>>> getResumeList(
			@RequestParam Long currentPage,
			@RequestParam Long size,
			@AuthenticationPrincipal Long userSq) {

		List<ResumeListResponse> fullList = resumeService.getAllResumes(userSq);

		int totalCount = fullList.size();
		int offset = (int) ((currentPage - 1) * size);
		int toIndex = Math.min(offset + size.intValue(), totalCount);
		List<ResumeListResponse> pagedList = fullList.subList(offset, toIndex);

		// 응답 본문 구성
		Map<String, Object> output = Map.of(
				"output", pagedList,
				"totalCount", totalCount);

		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "이력서 목록 조회 완료", output));
	}

	// 이력서 조회
	@GetMapping("/select-list")
	public ResponseEntity<ApiResponse<List<ResumeListResponse>>> getAllResumes(@AuthenticationPrincipal Long userSq) {
		List<ResumeListResponse> resumes = resumeService.getAllResumes(userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 조회가 완료",
				resumes));
	}

	@GetMapping("/list/{memberSq}")
	public ResponseEntity<ApiResponse<List<ResumeListResponse>>> getAllResumes(@AuthenticationPrincipal Long userSq,
			@PathVariable("memberSq") Long memberSq) {
		List<ResumeListResponse> resumes = resumeService.getAllResumes(memberSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 조회가 완료되었습니다.",
				resumes));
	}

	// 이력서 삭제
	@PatchMapping("/{resumeSq}/delete")
	public ResponseEntity<ApiResponse<String>> deleteResume(@PathVariable("resumeSq") Long resumeSq) {
		resumeService.softDeleteResume(resumeSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 삭제 완료", "success"));
	}

	@GetMapping("/project-history/skill-tags")
	public ResponseEntity<ApiResponse<List<CommonSkillTag>>> getAllSkills() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기술 태그 리스트 조회 완료", resumeService.getAllSkillTags()));
	}

	// 프로젝트 업무단, 역할
	@GetMapping("/project-history/type-codes")
	public ResponseEntity<ApiResponse<ProjectHistoryTypeCodeGroupResponseDTO>> getGroupedCodes() {
		ProjectHistoryTypeCodeGroupResponseDTO result = resumeService.getGroupedProjectHistoryTypeCodes();
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "타입 코드 리스트 조회 완료", result));
	}

	// 자격증 불러오기
	@GetMapping("/certificates")
	public ResponseEntity<ApiResponse<CertificateListResponseDTO>> getCertificates(
			@RequestParam(required = false) String searchNm,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "3") int size) {

		CertificateListResponseDTO result = resumeService.getCertificates(searchNm, page, size);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "자격증 리스트 조회 완료", result));
	}

	// 이력서 복사하기
	@PostMapping("/{resumeSq}/copy")
	public ResponseEntity<ApiResponse<Long>> copyResume(
			@PathVariable Long resumeSq,
			@AuthenticationPrincipal Long userSq) {
		Long copiedResumeSq = resumeService.copyResume(userSq, resumeSq);
		return ResponseEntity.ok(
				ApiResponse.of(HttpStatus.OK, "이력서 복사 완료", copiedResumeSq));
	}
}
