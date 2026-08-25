package com.example.demo.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.ApplySeedProjectDTO;
import com.example.demo.domain.admin.dto.request.ApplySeedRequestDTO;
import com.example.demo.domain.admin.dto.request.ApplySeedRevokeRequestDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedCommitResponseDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedPlanResponseDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedRevokeResponseDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedStatusResponseDTO;
import com.example.demo.domain.admin.service.AdminApplySeedService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 봇 지원 시드 (운영 도구).
 *
 * <p>
 * 채용중인 공고에 봇 계정이 지원한 것처럼 만들어, 실제 지원자가 붙기 전까지
 * 프로젝트 목록이 "지원 0건" 으로만 보이는 것을 메운다.
 * </p>
 *
 * <p>
 * {@code AdminSeedController}(커뮤니티 시드)와 같은 규약을 따른다 —
 * <b>미리보기와 실행의 URL 이 다르다.</b> {@code dryRun} 같은 불리언으로 갈랐다면
 * 필드 하나가 빠지는 순간 기본값 false 로 수백 건이 공용 DB 에 그대로 기록된다.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/admin/apply-seed")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminApplySeedController {

	private final AdminApplySeedService applySeedService;

	/** 지원을 붙일 수 있는 공고 — 모집기간이 오늘을 포함하는 것만. */
	@GetMapping("/projects")
	public ResponseEntity<ApiResponse<List<ApplySeedProjectDTO>>> projects() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "채용중 공고 조회 성공",
				applySeedService.findRecruitingProjects()));
	}

	/** 봇 계정 현황. 이력서를 가진 봇이 몇인지 화면에서 먼저 보여준다. */
	@GetMapping("/bots")
	public ResponseEntity<ApiResponse<ApplySeedStatusResponseDTO>> bots() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "봇 현황 조회 성공",
				applySeedService.status()));
	}

	/**
	 * 이력서가 없는 봇에게 이력서를 만들어 준다. 멱등하다 — 여러 번 눌러도 중복 생성되지 않는다.
	 *
	 * <p>
	 * 등록({@code /apply})이 내부에서 먼저 호출하므로 반드시 눌러야 하는 버튼은 아니다.
	 * 다만 100개를 한 번에 만들면 시간이 걸려, 등록 전에 미리 끝내 둘 수 있게 따로 열어 뒀다.
	 * </p>
	 */
	@PostMapping("/resumes")
	public ResponseEntity<ApiResponse<Integer>> ensureResumes() {
		int created = applySeedService.ensureResumes();
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,
				String.format("봇 이력서 %d건을 생성했습니다.", created), created));
	}

	/**
	 * 배분 미리보기. <b>DB 에 아무것도 쓰지 않는다.</b>
	 *
	 * <p>
	 * 응답의 {@code randomSeed} 와 {@code plannedAt} 을 등록 요청에 그대로 실어야 같은 결과가 나온다.
	 * </p>
	 */
	@PostMapping("/preview")
	public ResponseEntity<ApiResponse<ApplySeedPlanResponseDTO>> preview(
			@Valid @RequestBody ApplySeedRequestDTO request) {
		ApplySeedPlanResponseDTO plan = applySeedService.plan(request);
		log.info("[apply-seed] 미리보기 seed={} 공고={} 지원예정={}",
				plan.getRandomSeed(), plan.getSummary().getTargetProjects(),
				plan.getSummary().getTotalApplications());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "미리보기 생성 성공", plan));
	}

	/** 실제 등록. 미리보기 응답의 {@code randomSeed} 와 {@code plannedAt} 을 그대로 실어야 한다. */
	@PostMapping("/apply")
	public ResponseEntity<ApiResponse<ApplySeedCommitResponseDTO>> apply(
			@Valid @RequestBody ApplySeedRequestDTO request) {
		ApplySeedCommitResponseDTO result = applySeedService.commit(request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED,
				String.format("지원 %d건을 등록했습니다. (봇 이력서 %d건 신규 생성)",
						result.getInsertedApplications(), result.getCreatedResumes()),
				result));
	}

	/** 회수 미리보기. 무엇이 얼마나 내려가는지 공고별로 보여준다. 아무것도 지우지 않는다. */
	@PostMapping("/revoke/preview")
	public ResponseEntity<ApiResponse<ApplySeedRevokeResponseDTO>> revokePreview(
			@RequestBody ApplySeedRevokeRequestDTO request) {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회수 대상 조회 성공",
				applySeedService.revokePreview(request.getProjectSqs())));
	}

	/**
	 * 회수 실행 — 봇 지원을 물리 삭제하고 {@code project_candidate_cnt} 를 되돌린다.
	 *
	 * <p>
	 * 커뮤니티 시드처럼 논리 삭제하지 않는 이유는, 806(지원취소)으로 바꿔 두면 기업 화면에
	 * 취소 이력이 남고 같은 봇이 재지원할 수 있게 되기 때문이다. 시드는 흔적 없이 걷어내는 쪽이 맞다.
	 * </p>
	 */
	@PostMapping("/revoke")
	public ResponseEntity<ApiResponse<ApplySeedRevokeResponseDTO>> revoke(
			@RequestBody ApplySeedRevokeRequestDTO request) {
		ApplySeedRevokeResponseDTO result = applySeedService.revoke(request.getProjectSqs());
		log.info("[apply-seed] 회수 실행 지원={} 공고={}", result.getApplications(), result.getAffectedProjects());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,
				String.format("지원 %d건을 회수했습니다.", result.getApplications()), result));
	}
}
