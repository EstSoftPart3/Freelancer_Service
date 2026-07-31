package com.example.demo.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.request.SeedCommunityRequestDTO;
import com.example.demo.domain.admin.dto.request.SeedRevokeRequestDTO;
import com.example.demo.domain.admin.dto.response.SeedCommitResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedRevokeResponseDTO;
import com.example.demo.domain.admin.service.AdminSeedService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 커뮤니티 더미데이터 시드 (운영 도구).
 *
 * <p>
 * <b>{@code AdminBoardController} 에 합치지 않은 이유</b>
 * <ul>
 * <li>그쪽은 전부 {@code @ModelAttribute}/multipart 관례다. JSON + {@code @Valid} 를 섞으면
 * 한 파일에 두 규약이 공존한다. 이 저장소에서 검증이 실제로 도는 경로는 JSON 뿐이다.</li>
 * <li>시더는 운영 도구다. 나중에 통째로 들어낼 때 이 클래스와 BO 화면 하나만 지우면 된다.</li>
 * <li>위험 등급이 다르다 — 수백 행을 한 번에 쓰고 지운다. 격리해서 눈에 보이게 둔다.</li>
 * </ul>
 * </p>
 *
 * <p>
 * 미리보기와 등록은 <b>URL 이 다르다.</b> {@code dryRun} 같은 불리언 플래그로 갈랐다면
 * 필드 하나가 빠지는 순간 기본값 false 로 200건이 공용 DB 에 그대로 기록된다.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/admin/seed")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminSeedController {

	private final AdminSeedService adminSeedService;

	/** 외부 AI 에 붙여넣을 프롬프트. 카테고리는 공통코드에서 실시간으로 읽어 조립한다. */
	@GetMapping("/prompt")
	public ResponseEntity<ApiResponse<String>> getPrompt(
			@RequestParam(value = "count", defaultValue = "20") int count) {
		int normalized = Math.max(1, Math.min(count, 50));
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프롬프트 조회 성공",
				adminSeedService.buildPrompt(normalized)));
	}

	/**
	 * 배분 미리보기. <b>DB 에 아무것도 쓰지 않는다.</b>
	 *
	 * <p>
	 * 응답의 {@code randomSeed} 와 {@code plannedAt} 을 등록 요청에 그대로 실어야 같은 결과가 나온다.
	 * </p>
	 */
	@PostMapping("/community/preview")
	public ResponseEntity<ApiResponse<SeedPlanResponseDTO>> previewCommunity(
			@Valid @RequestBody SeedCommunityRequestDTO request) {
		SeedPlanResponseDTO plan = adminSeedService.plan(request);
		log.info("[seed] 미리보기 seed={} posts={} 게시글={} Q&A={} 답변={} 댓글={}",
				plan.getRandomSeed(), request.getPosts().size(),
				plan.getSummary().getTotalBoards(), plan.getSummary().getTotalQna(),
				plan.getSummary().getTotalAnswers(), plan.getSummary().getTotalComments());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "미리보기 생성 성공", plan));
	}

	/**
	 * 실제 등록. <b>미리보기 응답의 {@code randomSeed} 와 {@code plannedAt} 을 그대로 실어야 한다.</b>
	 *
	 * <p>
	 * {@code plannedAt} 이 없으면 거절한다 — 그 경우 서버가 기준 시각을 "지금" 으로 다시 잡아
	 * 미리보기와 다른 결과가 저장되기 때문이다.
	 * </p>
	 */
	@PostMapping("/community")
	public ResponseEntity<ApiResponse<SeedCommitResponseDTO>> commitCommunity(
			@Valid @RequestBody SeedCommunityRequestDTO request) {
		SeedCommitResponseDTO result = adminSeedService.commit(request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED,
				String.format("게시글 %d건, 답변 %d건, 댓글 %d건을 등록했습니다.",
						result.getInsertedBoards(), result.getInsertedAnswers(), result.getInsertedComments()),
				result));
	}

	/** 회수 미리보기. 무엇이 얼마나 내려가는지 표본과 함께 보여준다. 아무것도 지우지 않는다. */
	@PostMapping("/community/revoke/preview")
	public ResponseEntity<ApiResponse<SeedRevokeResponseDTO>> previewRevoke(
			@RequestBody SeedRevokeRequestDTO request) {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회수 대상 조회 성공",
				adminSeedService.revokePreview(request)));
	}

	/**
	 * 회수 실행 (논리 삭제).
	 *
	 * <p>
	 * {@code boardSqs} 를 주면 그 글만, 비우면 대상 계정이 쓴 <b>모든 글과 댓글</b>이 내려간다.
	 * 어느 쪽이든 봇 계정이 쓴 것만 대상이다.
	 * </p>
	 */
	@PostMapping("/community/revoke")
	public ResponseEntity<ApiResponse<SeedRevokeResponseDTO>> executeRevoke(
			@RequestBody SeedRevokeRequestDTO request) {
		SeedRevokeResponseDTO result = adminSeedService.revoke(request);
		log.info("[seed] 회수 실행 wide={} 게시글={} 답변={} 댓글={}",
				result.isWide(), result.getBoards(), result.getAnswers(), result.getComments());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,
				String.format("게시글 %d건, 답변 %d건, 댓글 %d건을 회수했습니다.",
						result.getBoards(), result.getAnswers(), result.getComments()),
				result));
	}
}
