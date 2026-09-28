package com.example.demo.domain.community.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.dto.CommunityBestItemDTO;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.service.BoardService;

import lombok.RequiredArgsConstructor;

/**
 * 커뮤니티 고도화용 통합 목록/베스트글 API.
 * - GET /community/boards: 전체보기(일반+Q&A) 통합 목록
 * - GET /community/best: 베스트글/인기 위젯/추천글 공용(복합 점수, 기간 파라미터만 다름)
 * - GET /community/board-categories: 게시판 카테고리 목록(공통코드 3200 하위)
 */
@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class CommunityController {

	private final BoardService boardService;
	private final CommonCodeMapper commonCodeMapper;

	@GetMapping("/boards")
	public ResponseEntity<ApiResponse<BoardListResponse>> getCommunityBoards(
			@RequestParam(value = "boardType", defaultValue = "all") String boardType,
			@RequestParam(value = "category", required = false) Long category,
			@RequestParam(value = "boardAdoptStatusCd", required = false) Long boardAdoptStatusCd,
			@RequestParam(value = "searchType", required = false) String searchType,
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "tag", required = false) String tag,
			@RequestParam(value = "sortType", defaultValue = "latest") String sortType,
			@RequestParam(value = "page", defaultValue = "1") Long page,
			@RequestParam(value = "size", defaultValue = "10") Long size) {

		// "all"이거나 알 수 없는 값이면 boardTypeCd=null → BoardService가 통합목록으로 처리한다.
		// ofPath는 미지 값을 NORMAL로 조용히 폴백하므로, 여기서는 그 폴백에 기대지 않고
		// "실제로 이 경로 문자열을 가진 통합목록 대상 종류인가"를 직접 확인한다.
		Long boardTypeCd = Arrays.stream(BoardTypeCode.values())
				.filter(BoardTypeCode::isInCommunityList)
				.filter(t -> t.getPath().equals(boardType))
				.findFirst()
				.map(BoardTypeCode::getCode)
				.orElse(null);

		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "커뮤니티 통합 목록 조회 성공",
				boardService.getAllBoards(boardTypeCd, category, boardAdoptStatusCd, searchType, keyword, tag, null,
						sortType,
						page, size)));
	}

	/**
	 * 게시판 카테고리(중분류) 목록.
	 *
	 * <p>
	 * Phase2 게시판 재설계(2026-09) 이후 중분류는 공통코드 3200 그룹 밑에 평평하게 있지 않고,
	 * 각 대분류 게시판 코드(1405 커리어소통 등)를 parent로 둔다 — 단, 일반게시판(NORMAL, 1401)만은
	 * 예외로 지금도 3200 그룹 아래에 남아 있고 그 그룹은 여전히 활성이다(아래 activeCategoryCds의
	 * 같은 예외 처리, {@code AdminSeedService} 시드 로직도 여전히 3200을 쓴다). {@code boardType}을
	 * 주면 그 대분류의 중분류만(NORMAL이면 3200 그룹), 생략하면 옛 3200 그룹을 그대로 돌려준다 —
	 * 하위 호환용으로만 남겨둔다.
	 * </p>
	 *
	 * <p>
	 * FO 탭·작성 폼이 코드와 라벨을 하드코딩하지 않도록 서버가 내려준다. 공통코드 이름만 바꾸면
	 * 재배포 없이 라벨이 따라오고, 비활성(`is_active_yn='N'`) 처리로 노출을 끌 수도 있다.
	 * </p>
	 */
	@GetMapping("/board-categories")
	public ResponseEntity<ApiResponse<List<CommonCodeDTO>>> getBoardCategories(
			@RequestParam(value = "boardType", required = false) String boardType) {
		Long parentCodeSq;
		if (boardType == null) {
			parentCodeSq = ParentCodeEnum.BOARD_CATEGORY.getCode();
		} else {
			// ofPath는 미지 값을 NORMAL로 조용히 폴백한다 — getCommunityBoards와 같은 이유로
			// 그 폴백에 기대지 않고, 실제로 존재하는 게시판 경로인지 먼저 확인한다.
			BoardTypeCode type = Arrays.stream(BoardTypeCode.values())
					.filter(t -> t.getPath().equals(boardType))
					.findFirst()
					.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
							HttpStatus.BAD_REQUEST, "알 수 없는 게시판입니다: " + boardType));
			// 일반게시판(NORMAL, 1401)은 새 게시판 종류처럼 자기 코드를 parent로 카테고리를 새로 두지
			// 않았다 — 예전 그대로 3200 그룹 아래에 있다(BoardService.activeCategoryCds와 같은 이유의
			// 같은 예외 처리).
			parentCodeSq = BoardTypeCode.NORMAL.equals(type) ? ParentCodeEnum.BOARD_CATEGORY.getCode()
					: type.getCode();
		}
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시판 카테고리 조회 성공",
				commonCodeMapper.findActiveChildrenByParent(parentCodeSq)));
	}

	@GetMapping("/best")
	public ResponseEntity<ApiResponse<List<CommunityBestItemDTO>>> getCommunityBest(
			@RequestParam(value = "period", defaultValue = "all") String period,
			@RequestParam(value = "size", defaultValue = "5") int size) {

		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "베스트글 조회 성공",
				boardService.getBestBoards(period, size)));
	}
}
