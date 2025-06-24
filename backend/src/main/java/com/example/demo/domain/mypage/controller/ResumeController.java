package com.example.demo.domain.mypage.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.mypage.dto.ProjectHistoryTypeCodeDTO;
import com.example.demo.domain.mypage.dto.RepResumeSwitchRequest;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.dto.response.CertificateListResponseDTO;
import com.example.demo.domain.mypage.dto.response.ProjectHistoryTypeCodeGroupResponseDTO;
import com.example.demo.domain.mypage.dto.response.ResumeListResponse;
import com.example.demo.domain.mypage.service.ResumeService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/mypage/resume")
@RequiredArgsConstructor

public class ResumeController {

	private final ResumeService resumeService;

	// 이력서 생성 (등록)
	@PostMapping
	public ResponseEntity<?> createResume(
			@AuthenticationPrincipal Long userSq,
			@RequestPart ResumeRequestDTO dto,
			@RequestPart(required = false) List<MultipartFile> profileImages,
			@RequestPart(required = false) List<MultipartFile> attachments) {

		int result = resumeService.createResume(userSq, dto, profileImages,
				attachments);
		if (result > 0) {
			return ResponseEntity.status(HttpStatus.CREATED).body("Resume created successfully");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create resume");
		}
	}

	// 이력서 수정
	@PutMapping("/{resumeSq}")
	public ResponseEntity<?> updateResume(
			@PathVariable Long resumeSq,
			@AuthenticationPrincipal Long userSq,
			@RequestPart ResumeRequestDTO dto,
			@RequestPart(required = false) List<MultipartFile> profileImages,
			@RequestPart(required = false) List<MultipartFile> attachments) {

		dto.setResumeSq(resumeSq); // 경로 변수로 받은 이력서 번호 설정

		int result = resumeService.updateResume(userSq, dto, profileImages, attachments);
		if (result > 0) {
			return ResponseEntity.ok("Resume updated successfully");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update resume");
		}
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

	// 이력서 조회
	@GetMapping("/list")
	public ResponseEntity<ApiResponse<List<ResumeListResponse>>> getAllResumes(@AuthenticationPrincipal Long userSq) {
		List<ResumeListResponse> resumes = resumeService.getAllResumes(userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 조회가 완료되었습니다.", resumes));
	}

	@GetMapping("/list/{memberSq}")
	public ResponseEntity<ApiResponse<List<ResumeListResponse>>> getAllResumes(@AuthenticationPrincipal Long userSq,
			@PathVariable("memberSq") Long memberSq) {
		List<ResumeListResponse> resumes = resumeService.getAllResumes(memberSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 조회가 완료되었습니다.", resumes));
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

	// // 이력서 등록
	// @PostMapping("/new")
	// public ResponseEntity<ApiResponse<ResumeRegisterResponse>> registerResume(
	// @AuthenticationPrincipal Long userSq, @RequestBody ResumeRegisterRequest
	// request) {
	// System.out.println("userSq = " + userSq);

	// if (userSq == null) {
	// return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	// .body(ApiResponse.of(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", null));
	// }

	// request.setUserSq(userSq);
	// System.out.println("📥 받은 이력서 등록 요청:" + request);
	// System.out.println("✅ DTO 내부 userSq = " + request.getUserSq());

	// try {
	// ResumeRegisterResponse response = resumeService.registerResume(request);
	// return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 등록 성공",
	// response));
	// } catch (IllegalArgumentException e) {
	// return ResponseEntity
	// .status(HttpStatus.BAD_REQUEST)
	// .body(ApiResponse.of(HttpStatus.BAD_REQUEST, e.getMessage(), null));
	// } catch (Exception e) {
	// return ResponseEntity
	// .status(HttpStatus.INTERNAL_SERVER_ERROR)
	// .body(ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.",
	// null));
	// }
	// }

	// //이력서 상세조회
	// @GetMapping("/detail/{resumeSq}")
	// public ResponseEntity<ApiResponse<ResumeRegisterResponse>>
	// getResumeById(@PathVariable("resumeSq") Long resumeSq) {
	// ResumeRegisterResponse resume = resumeService.getResumeById(resumeSq);
	// if (resume == null) {
	// return ResponseEntity.status(HttpStatus.NOT_FOUND)
	// .body(ApiResponse.of(HttpStatus.NOT_FOUND, "이력서가 없습니다.", null));
	// }
	// return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 상세 조회가 완료되었습니다.",
	// resume));
	// }

	// // 이력서 수정
	// @PutMapping("/update/{resumeSq}")
	// public ResponseEntity<ApiResponse<String>> updateResume(
	// @PathVariable("resumeSq") Long resumeSq,
	// @RequestBody ResumeRegisterRequest request) {
	// request.setResumeSq(resumeSq);
	// resumeService.updateResume(request);
	// return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "이력서 수정 완료",
	// "success"));
	// }

	// //이력서 기술 태그
	// @GetMapping("/skills")
	// public ResponseEntity<ApiResponse<List<ResumeSkillDataResponse>>>
	// getAllSkillTags() {
	// List<ResumeSkillDataResponse> skills = resumeService.getAllSkillTags();
	// return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, " ", skills));
	// }
}
