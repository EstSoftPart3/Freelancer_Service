package com.example.demo.domain.community.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.common.security.CurrentUser;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.converter.NormalTagConverter;
import com.example.demo.domain.community.converter.SkillTagConverter;
import com.example.demo.domain.community.dto.BoardListDTO;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.dto.CommunityBestItemDTO;
import com.example.demo.domain.community.dto.SkillTagDTO;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.AnswerListResponse;
import com.example.demo.domain.community.dto.response.BoardAttachmentResponse;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.dto.response.CommentResponse;
import com.example.demo.domain.community.entity.Board;
import com.example.demo.domain.community.entity.BoardAttachment;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.community.entity.Recommendation;
import com.example.demo.domain.community.mapper.AnswerMapper;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CmntTagMapper;
import com.example.demo.domain.community.mapper.CommentMapper;
import com.example.demo.domain.community.mapper.CommunityUserMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.repository.InformationEditRepository;
import com.example.demo.domain.mypage.service.InformationEditService;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.request.NotificationBatchRequestDTO;
import com.example.demo.domain.user.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardService {

	private final BoardMapper boardMapper;
	private final CmntTagMapper cmntTagMapper;
	private final CommentMapper commentMapper;
	private final CommentService commentService; // [추가] 트리 변환 로직 사용을 위해 주입
	private final AnswerMapper answerMapper;
	private final NormalTagConverter normalTagConverter;
	private final SkillTagConverter skillTagConverter;
	private final RecommendationMapper recommendationMapper;
	private final CommunityUserMapper communityUserMapper;
	private final AnswerService answerService;
	// private final AmazonS3Service amazonS3Service;
	private final FileStorageService fileStorageService;
	private final InformationEditRepository informationEditRepository;
	private final InformationEditService informationEditService;
	private final NotificationService notificationService;
	private final CommonCodeMapper commonCodeMapper;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	@Transactional
	public BoardListResponse getAllBoards(Long boardTypeCd, Long boardCategoryCd, Long boardAdoptStatusCd,
			String searchType, String keyword,
			String tag,
			List<Long> searchSkillTags, String sortType, Long page, Long size) {
		if (page < 1)
			page = 1L;
		Long offset = (page - 1L) * size;
		if (sortType == null || sortType.isEmpty())
			sortType = "latest";

		// 알 수 없는 카테고리 코드는 무시하고 전체를 보여준다 — URL을 손으로 고친 경우
		// 빈 목록보다 전체 목록이 덜 혼란스럽고, 검색 조건이라 예외로 막을 성질은 아니다.
		Long safeCategoryCd = (boardCategoryCd != null && activeCategoryCds().contains(boardCategoryCd))
				? boardCategoryCd
				: null;

		// 비공개(고객의 소리) 필터는 목록·카운트가 함께 받는다. 호출부 네 곳(게시판·Q&A·공지·커뮤니티)의
		// 시그니처를 늘리지 않으려고 SecurityContext 에서 직접 꺼낸다 — CurrentUser 주석 참조.
		Long viewerSq = CurrentUser.sq();
		boolean isAdmin = CurrentUser.isAdmin();

		List<Board> boards = boardMapper.findAll(boardTypeCd, safeCategoryCd, boardAdoptStatusCd, searchType, keyword,
				tag,
				searchSkillTags,
				sortType, size, offset, viewerSq, isAdmin);
		Long totalElements = boardMapper.findAllCnt(boardTypeCd, safeCategoryCd, boardAdoptStatusCd, searchType, keyword,
				tag,
				searchSkillTags, viewerSq, isAdmin);

		List<BoardListDTO> responses = boards.stream()
				.filter(Objects::nonNull)
				.map(board -> {
					// 각 게시글의 일반 태그 조회
					List<String> normalTags = normalTagConverter
							.convertNormalTagsToStrings(cmntTagMapper.findNT(board.getBoardSq(), null));

					// 각 게시글의 스킬 태그 조회
					List<SkillTagDTO> skillTags = skillTagConverter
							.convertSkillTagsToStrings(cmntTagMapper.findST(board.getBoardSq(), null));

					// 각 게시글의 답변 리스트 조회
					Integer boardAnswerCnt = answerMapper.findAllCnt(board.getBoardSq());

					// 각 게시글의 작성자 조회
					UserDTO userInfo = communityUserMapper.findById(board.getUserSq());
					String userNickname = Optional.ofNullable(userInfo)
							.map(UserDTO::getUserNickname)
							.orElse("탈퇴한 사용자");

					// BoardListResponse 생성 (태그 포함)
					return BoardListDTO.fromEntity(board, userNickname, boardAnswerCnt, normalTags, skillTags);
				})
				.collect(Collectors.toList());

		return BoardListResponse.builder().page(page).size(size).totalElements(totalElements).boards(responses).build();
	}

	private static final Set<String> ALLOWED_BEST_PERIODS = Set.of("daily", "weekly", "monthly", "all");

	public List<CommunityBestItemDTO> getBestBoards(String period, int size) {
		String safePeriod = ALLOWED_BEST_PERIODS.contains(period) ? period : "all";
		int safeSize = Math.max(1, Math.min(size, 20));
		return boardMapper.findBestBoards(safePeriod, safeSize);
	}

	@Transactional
	public BoardResponse getBoard(Long userSq, Long boardSq, Long boardTypeCd) {
		Board board = boardMapper.findByIdBoard(boardSq, boardTypeCd);
		if (board == null) {
			throw new IllegalArgumentException("게시글이 존재하지 않습니다.");
		} else if (board.getBoardIsDeletedYn().equals("Y")) {
			throw new IllegalArgumentException("삭제된 게시글입니다.");
		}

		List<String> normalTags = normalTagConverter.convertNormalTagsToStrings(cmntTagMapper.findNT(boardSq, null));
		List<SkillTagDTO> skillTags = skillTagConverter.convertSkillTagsToStrings(cmntTagMapper.findST(boardSq, null));

		// 게시글의 작성자 조회
		UserDTO userInfo = communityUserMapper.findById(board.getUserSq());
		String userNickname = Optional.ofNullable(userInfo)
				.map(UserDTO::getUserNickname)
				.orElse("탈퇴한 사용자");

		List<AnswerListResponse> answerListResponses = answerService.getAllAnswers(board.getBoardSq());

		// --- [댓글 조회 및 트리 구조 변환 로직 시작] ---

		// 1. 게시글의 모든 댓글 조회 (평면 리스트)
		List<CommentResponse> flatComments = commentMapper.findByBoardSq(boardSq).stream()
				.filter(Objects::nonNull)
				.map(comment -> {
					UserDTO userDto = communityUserMapper.findById(comment.getUserSq());
					String profileImageUrl = informationEditService.getProfileImageUrl(userDto.getUserSq());
					return CommentResponse.fromEntity(comment, userDto, profileImageUrl);
				})
				.collect(Collectors.toList());

		// 2. [핵심] CommentService의 유틸리티를 사용하여 트리 구조로 변환
		List<CommentResponse> commentTree = commentService.convertToTree(flatComments);

		// --- [댓글 조회 및 트리 구조 변환 로직 종료] ---

		// 게시글의 첨부파일 조회
		List<Long> fileSqs = boardMapper.findFiles(boardSq);
		List<BoardAttachmentResponse> files = fileSqs.stream()
				.filter(Objects::nonNull)
				.map(fileSq -> {
					BoardAttachment attachment = boardMapper.findFile(fileSq);
					if (attachment == null)
						return null;
					return BoardAttachmentResponse.builder()
							.fileSq(attachment.getFileSq())
							.fileOriginalNm(attachment.getFileOriginalNm())
							.fileSaveNm(attachment.getFileSaveNm())
							.build();
				})
				.filter(Objects::nonNull)
				.collect(Collectors.toList());

		// 변환된 commentTree를 넘겨줍니다.
		return BoardResponse.fromEntity(board, userNickname, normalTags, skillTags, answerListResponses, commentTree, userSq,
				files);
	}

	/**
	 * 작성자 확인. {@code @AuthenticationPrincipal}이 null이면 여기서 401로 끊는다.
	 *
	 * <p>
	 * {@code JwtAuthenticationFilter.EXCLUDE_URLS}에 {@code /api/board}가 들어 있어
	 * <b>토큰이 없거나 만료된 POST도 필터를 통과한다.</b> 그래서 지금까지는 userSq가 null인 채로
	 * INSERT까지 내려가 {@code Column 'user_sq' cannot be null} SQL 예외가
	 * <b>500 + 원본 스택으로 사용자에게 노출</b>됐다. 게다가 401이 아니어서
	 * FO의 refresh 인터셉터도 동작하지 않아, 토큰이 만료되면 재로그인 전까지 글쓰기가 막혔다.
	 * </p>
	 *
	 * <p>
	 * 401로 바꾸면 FO {@code lib/api.ts}가 토큰을 재발급해 자동 재시도한다.
	 * 컨트롤러가 아니라 서비스에 두는 이유는 게시판·Q&A·BO가 모두 이 메서드를 지나기 때문이다.
	 * </p>
	 */
	private void requireWriter(Long userSq) {
		if (userSq == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
		}
	}

	/**
	 * 카테고리는 일반게시판(1401)에만 쓴다. Q&A·공지·고객의소리는 카테고리 개념이 없으므로
	 * 값이 실려 와도 무시한다(FO 실수로 엉뚱한 게시판에 카테고리가 박히는 것을 막는다).
	 *
	 * <p>
	 * 미선택(null)은 정상이며 '미분류'로 저장된다 — 카테고리 도입 전 기존 글도 같은 상태다.
	 * 반면 목록에 없는 코드가 오면 조용히 삼키지 않고 거절한다. 저장은 되돌리기 어렵고,
	 * 잘못된 코드가 들어가면 어느 탭에서도 보이지 않는 유령 글이 된다.
	 * </p>
	 */
	private Long resolveCategoryCd(Long boardTypeCd, Long categoryCd) {
		if (!BoardTypeCode.NORMAL.getCode().equals(boardTypeCd)) {
			return null;
		}
		if (categoryCd == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요.");
		}
		if (!activeCategoryCds().contains(categoryCd)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 게시판 카테고리입니다.");
		}
		return categoryCd;
	}

	/**
	 * 현재 노출 중인 카테고리 코드 집합. <b>공통코드가 유일한 출처다.</b>
	 *
	 * <p>
	 * 하드코딩된 enum으로 검증하면 공통코드를 비활성(`is_active_yn='N'`)으로 내려도
	 * 그 코드로 계속 글을 쓸 수 있고, 이름을 바꿔도 뱃지 라벨은 옛 값이 남는다.
	 * 목록·뱃지·검증이 전부 같은 표를 보게 해서 그 어긋남을 없앤다.
	 * 글쓰기는 드문 요청이라 여기서 매번 조회해도 비용이 문제되지 않는다.
	 * </p>
	 */
	/**
	 * 비공개 플래그를 'Y'/'N' 으로 환산한다. <b>고객의 소리(1404)에서만 유효</b>하고
	 * 다른 게시판은 값이 실려 와도 'N' 으로 눌러 담는다 — 일반 게시판에 비공개 글이 생기면
	 * 목록 필터가 조용히 그 글을 숨겨 "글이 사라졌다"는 신고로 돌아온다.
	 *
	 * <p>
	 * 반환값 null 은 "건드리지 않음"이다(수정 시 기존 값 유지). 등록은 매퍼의 COALESCE 가 'N' 으로 채운다.
	 * </p>
	 */
	private String resolveSecretYn(Long boardTypeCd, Boolean isSecret) {
		if (!BoardTypeCode.VOC.getCode().equals(boardTypeCd)) {
			return "N";
		}
		if (isSecret == null) {
			return null;
		}
		return isSecret ? "Y" : "N";
	}

	private Set<Long> activeCategoryCds() {
		return commonCodeMapper.findActiveChildrenByParent(ParentCodeEnum.BOARD_CATEGORY.getCode())
				.stream()
				.map(CommonCodeDTO::getCommonCodeSq)
				.collect(Collectors.toSet());
	}

	@Transactional
	public void createBoard(BoardRequest boardRequest, Long BoardTypeCd) {
		requireWriter(boardRequest.getUserSq());

		// 게시글 오류 처리
		if (boardRequest.getTtl() == null) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		} else if (boardRequest.getDescription() == null) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		// board_type_cd(숫자) ↔ board_typ(문자열) 대응은 BoardTypeCode가 단독으로 책임진다.
		// 기존 if-else는 1404(고객의소리)가 들어오면 조용히 "normal"로 저장돼 Phase 5에서 문제가 된다.
		String typeStr = BoardTypeCode.typOf(BoardTypeCd);

		Board board = Board.builder()
				.userSq(boardRequest.getUserSq())
				.boardTtl(boardRequest.getTtl())
				.boardDescriptionEdt(boardRequest.getDescription())
				.boardTyp(typeStr)
				.boardCategoryCd(resolveCategoryCd(BoardTypeCd, boardRequest.getCategoryCd()))
				.boardIsSecretYn(resolveSecretYn(BoardTypeCd, boardRequest.getIsSecret()))
				.boardTypeCd(BoardTypeCd).build();

		boardMapper.insert(board);

		if (board.getBoardSq() == null) {
			throw new IllegalStateException("게시글 생성 실패: Primary Key가 생성되지 않았습니다.");
		}

		// 1. 일반 태그 처리 수정
		if (boardRequest.getNormalTags() != null && !boardRequest.getNormalTags().isEmpty()) {
			cmntTagMapper.insertNT(normalTagConverter.convertStringsToNormalTags(
					board.getBoardSq(), null, boardRequest.getNormalTags()));
		}

		// 2. 스킬 태그 처리 수정 (updateBoard 포함)
		if (board.getBoardTypeCd() == 1402 &&
				boardRequest.getSkillTags() != null && !boardRequest.getSkillTags().isEmpty()) {
			cmntTagMapper.insertST(skillTagConverter.convertStringsToSkillTags(
					board.getBoardSq(), null, boardRequest.getSkillTags()));
		}

		// 첨부파일 업로드
		if (boardRequest.getFiles() != null) {
			for (MultipartFile file : boardRequest.getFiles()) {

				UploadedFileDTO uploaded = fileStorageService.uploadFile(file);

				ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
						.originalName(uploaded.getOriginalName())
						.savedName(uploaded.getSavedName())
						.contentType(uploaded.getContentType())
						.size(uploaded.getSize())
						.build();

				informationEditRepository.saveFile(fileInfo);
				boardMapper.insertFile(board.getBoardSq(), fileInfo.getFileSq());
			}
		}

		if (BoardTypeCd == 1403L) {
			List<Long> allUserSqs = communityUserMapper.findAllUserSqs();

			if (allUserSqs != null && !allUserSqs.isEmpty()) {
				try {
					List<NotificationBatchRequestDTO> batchList = allUserSqs.stream()
							.filter(receiverSq -> !receiverSq.equals(board.getUserSq()))
							.map(receiverSq -> new NotificationBatchRequestDTO(
									receiverSq,
									board.getUserSq(),
									2606L,
									"새로운 공지사항이 등록되었습니다: " + board.getBoardTtl(),
									"/notice/" + board.getBoardSq()))
							.collect(Collectors.toList());

					notificationService.insertNotificationBatch(batchList);
				} catch (Exception e) {
				}
			}
		}

		return;
	}

	@Transactional
	public void updateBoard(BoardRequest boardRequest, Long boardSq, Long boardTypeCd) {
		requireWriter(boardRequest.getUserSq());

		// 게시글 업데이트
		if (boardRequest.getTtl() == null) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		} else if (boardRequest.getDescription() == null) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		Board board = boardMapper.findByIdBoard(boardSq, boardTypeCd);

		// if (board.getUserSq() != boardRequest.getUserSq()) {
		// throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(board.getUserSq(), boardRequest.getUserSq())) {
			throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		}

		board.setBoardTtl(boardRequest.getTtl());
		board.setBoardDescriptionEdt(boardRequest.getDescription());
		// 일반게시판은 카테고리가 필수라 수정에서도 검증한다.
		// 카테고리 개념이 없는 게시판(공지 등)은 resolveCategoryCd가 null을 돌려주므로,
		// 그쪽 호출부가 기존 값을 지우지 않도록 1401일 때만 대입한다.
		if (BoardTypeCode.NORMAL.getCode().equals(boardTypeCd)) {
			board.setBoardCategoryCd(resolveCategoryCd(boardTypeCd, boardRequest.getCategoryCd()));
		}
		// 고객의 소리만 공개/비공개 전환을 허용한다. null 이면 기존 값을 유지한다(매퍼 COALESCE).
		if (BoardTypeCode.VOC.getCode().equals(boardTypeCd)) {
			board.setBoardIsSecretYn(resolveSecretYn(boardTypeCd, boardRequest.getIsSecret()));
		}

		if (boardRequest.getBoardAdoptStatusCd() != null) {
			board.setBoardAdoptStatusCd(boardRequest.getBoardAdoptStatusCd());
		}

		boardMapper.update(board);

		// 기존 태그 삭제
		cmntTagMapper.deleteNT(board.getBoardSq(), null);
		cmntTagMapper.deleteST(board.getBoardSq(), null);

		// 1. 일반 태그 처리 수정
		if (boardRequest.getNormalTags() != null && !boardRequest.getNormalTags().isEmpty()) {
			cmntTagMapper.insertNT(normalTagConverter.convertStringsToNormalTags(
					board.getBoardSq(), null, boardRequest.getNormalTags()));
		}

		// 2. 스킬 태그 처리 수정
		if (board.getBoardTypeCd() == 1402 &&
				boardRequest.getSkillTags() != null && !boardRequest.getSkillTags().isEmpty()) {
			cmntTagMapper.insertST(skillTagConverter.convertStringsToSkillTags(
					board.getBoardSq(), null, boardRequest.getSkillTags()));
		}

		// 첨부파일
		// 기존 첨부파일 변동 여부 확인
		List<Long> fileSqs = boardMapper.findFiles(boardSq);
		List<Long> clientFileSqs = boardRequest.getAttachments() != null
				? boardRequest.getAttachments()
				: new ArrayList<>();

		Set<Long> clientFileSqSet = new HashSet<>(clientFileSqs);
		List<Long> deletedFileSqs = fileSqs.stream()
				.filter(fileSq -> !clientFileSqSet.contains(fileSq))
				.collect(Collectors.toList());
		for (Long fileSq : deletedFileSqs) {
			deleteFile(board.getBoardSq(), fileSq);
		}

		// 새로운 첨부파일 추가
		// 첨부파일 업로드
		if (boardRequest.getFiles() != null) {
			for (MultipartFile file : boardRequest.getFiles()) {

				UploadedFileDTO uploaded = fileStorageService.uploadFile(file);

				ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
						.originalName(uploaded.getOriginalName())
						.savedName(uploaded.getSavedName())
						.contentType(uploaded.getContentType())
						.size(uploaded.getSize())
						.build();

				informationEditRepository.saveFile(fileInfo);
				boardMapper.insertFile(board.getBoardSq(), fileInfo.getFileSq());
			}
		}

		return;
	}

	@Transactional
	public void deleteBoard(Long userSq, Long boardSq) {
		boardMapper.delete(userSq, boardSq);
		cmntTagMapper.deleteNT(boardSq, null);
		cmntTagMapper.deleteST(boardSq, null);
		recommendationMapper.deleteAll(boardSq, null, null);

	}

	@Transactional
	public void addViewCntBoard(Long boardSq) {
		boardMapper.addViewCnt(boardSq);
	}

	// 추천
	@Transactional
	public void updateBoardRecommend(Long userSq, Long boardSq) {

		if (userSq == null) {
			throw new IllegalArgumentException("로그인 후 이용해주세요.");
		}

		Recommendation recommendation = recommendationMapper.findByBoardSq(userSq, boardSq);

		if (recommendation == null) {
			recommendation = Recommendation.builder().boardSq(boardSq).userSq(userSq).recommendationTypeCd(1901L)
					.build();
			recommendationMapper.insert(recommendation);

		} else {
			recommendationMapper.delete(recommendation.getRecommendationSq());
		}

		boardMapper.updateRecommendCnt(boardSq);

		return;

	}

	// 전체 스킬 태그 리스트 조회
	@Transactional
	public List<CommonSkillTag> getAllSkillTags() {
		List<CommonSkillTag> parentTags = cmntTagMapper.findParentSkillTags();
		List<CommonSkillTag> childrenTags = cmntTagMapper.findAll(parentTags);
		List<CommonSkillTag> allTags = new ArrayList<>();
		allTags.addAll(parentTags);
		allTags.addAll(childrenTags);

		return allTags;

	}

	// 첨부파일 삭제
	@Transactional
	public void deleteFile(Long boardSq, Long fileSq) {
		boardMapper.deleteBoardFile(boardSq, fileSq);
		boardMapper.deleteFile(fileSq);
		return;
	}

	// 채택 상태 변경
	@Transactional
	public void updateStatusBoard(Long userSq, Long boardSq, Long statusCd) {

		Board board = boardMapper.findByIdBoard(boardSq, 1402L);

		// if (board.getUserSq() != userSq) {
		// throw new IllegalArgumentException("유효하지 않은 접근입니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(board.getUserSq(), userSq)) {
			throw new IllegalArgumentException("유효하지 않은 접근입니다.");
		}

		if (board.getBoardAdoptStatusCd() != 1501L) {
			throw new IllegalArgumentException("채택 상태가 이미 변경되었습니다.");
		}

		board.setBoardAdoptStatusCd(statusCd);
		boardMapper.update(board);

		return;
	}

}
