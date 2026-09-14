package com.example.demo.domain.community.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.viewcount.ViewCountDedupService;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.SkillTagDTO;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.service.BoardService;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import javax.lang.model.type.NullType;
import lombok.RequiredArgsConstructor;

/**
 * Phase2 게시판 재설계(2026-09)로 신설된 5개 게시판(커리어소통·기술소통·요즘회사·프로젝트·라운지)의
 * 공용 컨트롤러 — {@link BoardController}/{@link QnaController}처럼 종류마다 컨트롤러를 복제하지
 * 않고, {@code boardType} 경로 세그먼트로 {@link BoardTypeCode}를 찾아 그 capability로 분기한다.
 *
 * <p>
 * 채택 상태 변경({@code PUT /{boardType}/{boardSq}/status/{statusCd}})은
 * {@link BoardTypeCode#isSupportsAnswer()}가 true인 종류(커리어·기술)에서만 연다 — 나머지 종류로
 * 부르면 400을 준다(라운지 등에는 답변·채택 개념이 없다).
 * </p>
 */
@RestController
@RequestMapping("/{boardType:career|tech|company|teamup|lounge}")
@RequiredArgsConstructor
public class CommunityBoardController {

	private final BoardService boardService;
	private final ViewCountDedupService viewCountDedupService;

	private BoardTypeCode resolve(String boardType) {
		BoardTypeCode resolved = BoardTypeCode.ofPath(boardType);
		// ofPath는 미지 값을 NORMAL로 폴백한다 — 이 컨트롤러는 경로 regex로 이미 5종만 받으므로
		// 폴백이 실제로 발생하면(=매핑 누락) 조용히 일반게시판인 척하지 않고 바로 400을 낸다.
		if (resolved == BoardTypeCode.NORMAL && !"board".equals(boardType)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "알 수 없는 게시판입니다: " + boardType);
		}
		return resolved;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<BoardListResponse>> getAllBoards(
			@PathVariable("boardType") String boardType,
			@RequestParam(value = "category", required = false) Long category,
			@RequestParam(value = "boardAdoptStatusCd", required = false) Long boardAdoptStatusCd,
			@RequestParam(value = "searchType", required = false) String searchType,
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "tag", required = false) String tag,
			@RequestParam(value = "skillTags", required = false) List<Long> skillTags,
			@RequestParam(value = "sortType", defaultValue = "latest") String sortType,
			@RequestParam(value = "page", defaultValue = "1") Long page,
			@RequestParam(value = "size", defaultValue = "10") Long size) {

		BoardTypeCode type = resolve(boardType);
		// 채택상태 필터는 답변 지원 종류에서만 의미가 있다 — 나머지는 조용히 무시(빈 필터로 취급).
		Long safeAdoptStatusCd = type.isSupportsAnswer() ? boardAdoptStatusCd : null;
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 조회 성공",
				boardService.getAllBoards(type.getCode(), category, safeAdoptStatusCd, searchType, keyword, tag,
						skillTags, sortType, page, size)));
	}

	@GetMapping("/{boardSq}")
	public ResponseEntity<ApiResponse<BoardResponse>> getBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq) {
		BoardTypeCode type = resolve(boardType);
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "게시글 조회 성공", boardService.getBoard(userSq, boardSq, type.getCode())));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<NullType>> createBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@ModelAttribute BoardRequest boardRequest,
			@RequestParam(value = "skillTagsJson", required = false) String skillTagsJson) {
		BoardTypeCode type = resolve(boardType);
		if (type.isSupportsSkillTag() && skillTagsJson != null && !skillTagsJson.isBlank()) {
			boardRequest.setSkillTags(parseSkillTags(skillTagsJson));
		}
		boardRequest.setUserSq(userSq);
		boardService.createBoard(boardRequest, type.getCode());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "게시글 등록이 완료되었습니다.", null));
	}

	@PutMapping("/{boardSq}")
	public ResponseEntity<ApiResponse<NullType>> updateBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq,
			@ModelAttribute BoardRequest boardRequest,
			@RequestParam(value = "skillTagsJson", required = false) String skillTagsJson) {
		BoardTypeCode type = resolve(boardType);
		if (type.isSupportsSkillTag() && skillTagsJson != null && !skillTagsJson.isBlank()) {
			boardRequest.setSkillTags(parseSkillTags(skillTagsJson));
		}
		boardRequest.setUserSq(userSq);
		boardService.updateBoard(boardRequest, boardSq, type.getCode());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 수정이 완료되었습니다.", null));
	}

	@PatchMapping("/{boardSq}")
	public ResponseEntity<ApiResponse<NullType>> deleteBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq) {
		BoardTypeCode type = resolve(boardType);
		boardService.deleteBoard(userSq, boardSq, type.getCode());
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 삭제가 완료되었습니다.", null));
	}

	@PatchMapping("/{boardSq}/increment-view")
	public ResponseEntity<ApiResponse<NullType>> addViewCntBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq,
			HttpServletRequest request) {
		BoardTypeCode type = resolve(boardType);
		if (viewCountDedupService.isFirstView("board", boardSq, userSq, request)) {
			boardService.addViewCntBoard(boardSq, type.getCode());
		}
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가가 완료되었습니다.", null));
	}

	@PostMapping("/{boardSq}/recommend")
	public ResponseEntity<ApiResponse<NullType>> updateRecommendBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq) {
		resolve(boardType);
		boardService.updateBoardRecommend(userSq, boardSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "추천 반영이 완료되었습니다.", null));
	}

	// 답변 채택 상태 변경 — 답변을 지원하는 게시판(커리어·기술)에서만 연다.
	@PutMapping("/{boardSq}/status/{statusCd}")
	public ResponseEntity<ApiResponse<NullType>> updateStatusBoard(
			@PathVariable("boardType") String boardType,
			@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq,
			@PathVariable("statusCd") Long statusCd) {
		BoardTypeCode type = resolve(boardType);
		if (!type.isSupportsAnswer()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답변 채택 상태 변경은 지원되지 않는 게시판입니다.");
		}
		boardService.updateStatusBoard(userSq, boardSq, statusCd);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "답변 채택 상태 변경이 완료되었습니다.", null));
	}

	private List<SkillTagDTO> parseSkillTags(String skillTagsJson) {
		try {
			return new ObjectMapper().readValue(skillTagsJson, new TypeReference<List<SkillTagDTO>>() {
			});
		} catch (JsonProcessingException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "skillTags 변환 실패");
		}
	}
}
