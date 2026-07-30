package com.example.demo.domain.community.controller;

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

		// 주의: 3항 연산자 체인에서 long 리터럴과 null을 섞으면 결과 타입이 long으로 단일화되며
		// null 분기에서 암묵적 언박싱이 일어나 NPE가 발생한다(boardType=all일 때 재현됨).
		Long boardTypeCd;
		if ("board".equals(boardType)) {
			boardTypeCd = 1401L;
		} else if ("qna".equals(boardType)) {
			boardTypeCd = 1402L;
		} else {
			boardTypeCd = null;
		}

		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "커뮤니티 통합 목록 조회 성공",
				boardService.getAllBoards(boardTypeCd, category, boardAdoptStatusCd, searchType, keyword, tag, null,
						sortType,
						page, size)));
	}

	/**
	 * 게시판 카테고리 목록 (공통코드 3200 하위).
	 *
	 * <p>
	 * FO 탭·작성 폼이 코드와 라벨을 하드코딩하지 않도록 서버가 내려준다. 공통코드 이름만 바꾸면
	 * 재배포 없이 라벨이 따라오고, 비활성(`is_active_yn='N'`) 처리로 노출을 끌 수도 있다.
	 * </p>
	 */
	@GetMapping("/board-categories")
	public ResponseEntity<ApiResponse<List<CommonCodeDTO>>> getBoardCategories() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시판 카테고리 조회 성공",
				commonCodeMapper.findActiveChildrenByParent(ParentCodeEnum.BOARD_CATEGORY.getCode())));
	}

	@GetMapping("/best")
	public ResponseEntity<ApiResponse<List<CommunityBestItemDTO>>> getCommunityBest(
			@RequestParam(value = "period", defaultValue = "all") String period,
			@RequestParam(value = "size", defaultValue = "5") int size) {

		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "베스트글 조회 성공",
				boardService.getBestBoards(period, size)));
	}
}
