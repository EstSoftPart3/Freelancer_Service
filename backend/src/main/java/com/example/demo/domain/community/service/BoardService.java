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
import com.example.demo.domain.community.constant.BoardAdoptStatusCode;
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
		// size 는 쿼리 파라미터가 그대로 들어온다. 검증하지 않으면 ?size=-1 이 LIMIT -1 로 내려가
		// SQL 문법 오류 500 이 나고, ?size=100000 은 목록 한 건마다 태그·답변수·작성자를 다시 읽는
		// N+1 때문에 수십만 쿼리를 유발한다. getBestBoards 와 같은 방식으로 여기서도 조인다.
		if (size == null || size < 1)
			size = 10L;
		// 상한은 500 이다 — 100 으로 조이면 sitemap.ts 가 무너진다. sitemap 은
		// `size=500` 으로 목록을 훑으면서 `page * 500 >= totalElements` 로 종료를 판단하는데,
		// 서버가 100건만 돌려주면 한 페이지에 100건씩만 모으면서도 500건을 모은 것처럼 세어
		// 전체 글의 1/5 만 색인되고 나머지 URL 이 조용히 사라진다(/notice 목록도 같은 경로다).
		if (size > 500)
			size = 500L;
		Long offset = (page - 1L) * size;
		if (sortType == null || sortType.isEmpty())
			sortType = "latest";

		// 알 수 없는 카테고리 코드는 무시하고 전체를 보여준다 — URL을 손으로 고친 경우
		// 빈 목록보다 전체 목록이 덜 혼란스럽고, 검색 조건이라 예외로 막을 성질은 아니다.
		Long safeCategoryCd = (boardCategoryCd != null && activeCategoryCds(boardTypeCd).contains(boardCategoryCd))
				? boardCategoryCd
				: null;

		List<Board> boards = boardMapper.findAll(boardTypeCd, safeCategoryCd, boardAdoptStatusCd, searchType, keyword,
				tag,
				searchSkillTags,
				sortType, size, offset, BoardTypeCode.communityListCodes());
		Long totalElements = boardMapper.findAllCnt(boardTypeCd, safeCategoryCd, boardAdoptStatusCd, searchType, keyword,
				tag,
				searchSkillTags, BoardTypeCode.communityListCodes());

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
		return boardMapper.findBestBoards(safePeriod, safeSize, BoardTypeCode.communityListCodes());
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
					// 탈퇴 회원은 findById 가 null 을 돌려준다(쿼리에 user_is_deleted_yn = 'N' 이 걸려 있다).
					// 여기서 바로 getUserSq() 를 부르면 댓글 한 건 때문에 게시글 상세 전체가 500 이 난다.
					// CommentResponse.fromEntity 는 이미 null userDto 를 "탈퇴한 사용자"로 처리한다.
					String profileImageUrl = userDto != null
							? informationEditService.getProfileImageUrl(userDto.getUserSq())
							: null;
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
	 * 카테고리는 {@link BoardTypeCode#isHasCategory()} 가 true 인 게시판(일반·커리어소통·기술소통·
	 * 프로젝트·라운지)에만 쓴다. Q&A·공지·고객의소리·요즘회사는 카테고리 개념이 없으므로
	 * 값이 실려 와도 무시한다(FO 실수로 엉뚱한 게시판에 카테고리가 박히는 것을 막는다).
	 *
	 * <p>
	 * 카테고리가 있는 게시판에서는 <b>미선택(null)도 거절한다</b>(400). 기존 글의 NULL 은 '미분류'로 남겨 두지만,
	 * 새 글·수정 글까지 미분류를 허용하면 어느 카테고리 탭에도 걸리지 않는 글이 계속 늘어난다.
	 * 그래서 수정 요청에도 카테고리를 반드시 실어 보내야 한다 — 카테고리를 빼고 제목만 고치는
	 * 클라이언트가 있으면 그쪽이 400 을 맞는다.
	 * </p>
	 *
	 * <p>
	 * 목록에 없는 코드도 조용히 삼키지 않고 거절한다. 저장은 되돌리기 어렵고,
	 * 잘못된 코드가 들어가면 어느 탭에서도 보이지 않는 유령 글이 된다.
	 * </p>
	 *
	 * <p>
	 * BO 수정 경로({@code AdminBoardService.updateBoardLogic})도 이 메서드를 쓴다 —
	 * 활성 카테고리 판정이 FO 와 갈리면 BO 에서만 통과하는 코드가 생긴다.
	 * </p>
	 */
	public Long resolveCategoryCd(Long boardTypeCd, Long categoryCd) {
		if (!BoardTypeCode.of(boardTypeCd).isHasCategory()) {
			return null;
		}
		if (categoryCd == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요.");
		}
		if (!activeCategoryCds(boardTypeCd).contains(categoryCd)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 게시판 카테고리입니다.");
		}
		return categoryCd;
	}

	/**
	 * 비공개 플래그를 'Y'/'N' 으로 환산한다. <b>고객의 소리(1404)에서만 유효</b>하고
	 * 다른 게시판은 값이 실려 와도 'N' 으로 눌러 담는다 — 비공개 개념이 없는 게시판에
	 * 'Y' 가 박히면 상세 조회 권한 검사가 없는 채로 목록에만 자물쇠가 뜨는 반쪽 상태가 된다.
	 *
	 * <p>
	 * 반환값 null 은 "건드리지 않음"이다(수정 시 기존 값 유지). 등록은 매퍼의 COALESCE 가 'N' 으로 채운다.
	 * </p>
	 */
	private String resolveSecretYn(Long boardTypeCd, Boolean isSecret) {
		if (!BoardTypeCode.of(boardTypeCd).isSupportsSecret()) {
			return "N";
		}
		if (isSecret == null) {
			return null;
		}
		return isSecret ? "Y" : "N";
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
	 *
	 * <p>
	 * Phase2 게시판 재설계(2026-09) 이후 중분류는 공통코드 3200 그룹이 아니라 각 게시판 종류
	 * 코드(1405 커리어소통 등)를 parent로 둔다. {@code boardTypeCd}가 null이면(통합목록) 중분류
	 * 개념이 없으므로 빈 집합을 돌려준다 — 통합목록에서 카테고리 필터를 걸 일이 없다.
	 * </p>
	 */
	private Set<Long> activeCategoryCds(Long boardTypeCd) {
		if (boardTypeCd == null) return Set.of();
		return commonCodeMapper.findActiveChildrenByParent(boardTypeCd)
				.stream()
				.map(CommonCodeDTO::getCommonCodeSq)
				.collect(Collectors.toSet());
	}

	/**
	 * 게시글 등록. 생성된 {@code board_sq} 를 돌려준다 — 등록 직후 그 글을 가리키는 링크나 알림을
	 * 만들어야 하는 호출부(고객의 소리 메일 알림)가 있어서다. 반환값을 무시해도 되므로
	 * 기존 호출부는 손대지 않았다.
	 */
	@Transactional
	public Long createBoard(BoardRequest boardRequest, Long BoardTypeCd) {
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
		if (BoardTypeCode.of(board.getBoardTypeCd()).isSupportsSkillTag() &&
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

		// Long == long 리터럴은 언박싱 비교라 null 이 오면 NPE 다. 나머지 분기와 같은 방식으로 맞춘다.
		if (BoardTypeCode.NOTICE.getCode().equals(BoardTypeCd)) {
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

		return board.getBoardSq();
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
		// findByIdBoard 는 게시판 종류까지 맞아야 행을 준다. 없는 번호거나 다른 게시판의 번호로
		// 수정 요청이 오면(PUT /qna/{일반게시판 sq}) 아래 getUserSq() 에서 NPE 500 이 났다.
		if (board == null || "Y".equals(board.getBoardIsDeletedYn())) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 게시글입니다.");
		}

		// if (board.getUserSq() != boardRequest.getUserSq()) {
		// throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		// }

		// sq 비교 방식 변경
		// 관리자는 남의 글도 고친다 — deleteBoard 와 같은 이유다. BO 공지 관리
		// (AdminNoticeController.updateNotice)가 이 경로를 쓰는데, 공지를 등록한 관리자 계정과
		// 수정하는 계정이 다른 것이 정상이라 작성자 일치만 보면 BO 공지 수정이 전부 400 이 된다.
		if (!CurrentUser.isAdmin() && !Objects.equals(board.getUserSq(), boardRequest.getUserSq())) {
			throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		}

		board.setBoardTtl(boardRequest.getTtl());
		board.setBoardDescriptionEdt(boardRequest.getDescription());
		// 일반게시판은 카테고리가 필수라 수정에서도 검증한다.
		// 카테고리 개념이 없는 게시판(공지 등)은 resolveCategoryCd가 null을 돌려주므로,
		// 그쪽 호출부가 기존 값을 지우지 않도록 1401일 때만 대입한다.
		if (BoardTypeCode.of(boardTypeCd).isHasCategory()) {
			board.setBoardCategoryCd(resolveCategoryCd(boardTypeCd, boardRequest.getCategoryCd()));
		}
		// 비공개 전환을 지원하는 게시판만 허용한다. null 이면 기존 값을 유지한다(매퍼 COALESCE).
		if (BoardTypeCode.of(boardTypeCd).isSupportsSecret()) {
			board.setBoardIsSecretYn(resolveSecretYn(boardTypeCd, boardRequest.getIsSecret()));
		}

		// 채택 상태는 답변을 지원하는 게시판 전용이고, updateStatusBoard 와 같은 규칙으로 검증한다.
		// 검증 없이 대입하면 PUT /qna/{내 글} 본문에 boardAdoptStatusCd=1502 를 실어
		// "채택완료인데 채택된 답변이 0건"인 글을 만들 수 있고(BoardAdoptStatusCode 의 불변식 위반),
		// 9999 같은 값이면 목록 필터·라벨이 전부 어긋난다.
		// 값이 지금과 같으면(폼이 기존 값을 그대로 되돌려 보내는 경우) 그냥 통과시킨다.
		Long requestedAdoptStatus = boardRequest.getBoardAdoptStatusCd();
		if (requestedAdoptStatus != null
				&& BoardTypeCode.of(boardTypeCd).isSupportsAnswer()
				&& !requestedAdoptStatus.equals(board.getBoardAdoptStatusCd())) {
			if (!BoardAdoptStatusCode.isUserSelectable(requestedAdoptStatus)
					|| BoardAdoptStatusCode.ADOPTED.getCode().equals(board.getBoardAdoptStatusCd())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 수 없는 채택 상태입니다.");
			}
			board.setBoardAdoptStatusCd(requestedAdoptStatus);
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
		// createBoard 쪽과 같은 비교를 쓴다 — Long == int 리터럴은 언박싱이라
		// board_type_cd 가 NULL 인 행을 만나면 여기서 NPE 가 난다.
		if (BoardTypeCode.of(board.getBoardTypeCd()).isSupportsSkillTag() &&
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

	/**
	 * 게시판 종류를 확인한 뒤 삭제한다. {@code PATCH /board/{내 Q&A 글 번호}} 처럼 엉뚱한 라우트로
	 * 들어온 요청이 다른 게시판의 글을 지우지 못하게 막는다({@code VocService.deleteVoc} 와 같은 이유).
	 */
	@Transactional
	public void deleteBoard(Long userSq, Long boardSq, Long boardTypeCd) {
		Board typed = boardMapper.findByIdBoard(boardSq, boardTypeCd);
		if (typed == null || "Y".equals(typed.getBoardIsDeletedYn())) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 게시글입니다.");
		}
		deleteBoard(userSq, boardSq);
	}

	@Transactional
	public void deleteBoard(Long userSq, Long boardSq) {
		// delete 쿼리만 user_sq 로 걸려 있고 아래 세 개의 정리 쿼리는 board_sq 만 본다.
		// 소유자 확인 없이 내려가면 남의 글 번호로 호출했을 때 글은 그대로 남은 채
		// 태그와 추천 기록만 지워진다("추천 수가 0이 됐다"는 신고로 돌아온다).
		Board board = boardMapper.findByIdOnly(boardSq);
		if (board == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 게시글입니다.");
		}
		// 관리자는 남의 글도 지운다 — BO 공지 관리(AdminNoticeController)가 이 경로를 쓰는데,
		// 공지를 등록한 관리자 계정과 지우는 계정이 다른 것이 정상이라 작성자 일치만 보면 전부 403 이 된다.
		boolean admin = CurrentUser.isAdmin();
		if (!admin && !Objects.equals(board.getUserSq(), userSq)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 글만 삭제할 수 있습니다.");
		}

		// delete 쿼리가 user_sq 를 조건으로 걸기 때문에, 관리자 삭제에서는 작성자 sq 로 맞춰 준다.
		// (그러지 않으면 권한만 통과하고 0행 업데이트로 끝나 "삭제했는데 그대로"가 된다)
		boardMapper.delete(admin ? board.getUserSq() : userSq, boardSq);
		cmntTagMapper.deleteNT(boardSq, null);
		cmntTagMapper.deleteST(boardSq, null);
		recommendationMapper.deleteAll(boardSq, null, null);

	}

	/**
	 * 게시판 종류를 확인한 뒤 조회수를 올린다. {@code addViewCnt} 는 board_sq 만 보고 올리기 때문에,
	 * 확인이 없으면 {@code PATCH /qna/{일반게시판 sq}/increment-view} 로 엉뚱한 게시판 카운터가 오른다.
	 */
	@Transactional
	public void addViewCntBoard(Long boardSq, Long boardTypeCd) {
		Board board = boardMapper.findByIdBoard(boardSq, boardTypeCd);
		if (board == null || "Y".equals(board.getBoardIsDeletedYn())) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 게시글입니다.");
		}
		boardMapper.addViewCnt(boardSq);
	}

	@Transactional
	public void addViewCntBoard(Long boardSq) {
		boardMapper.addViewCnt(boardSq);
	}

	// 추천
	@Transactional
	public void updateBoardRecommend(Long userSq, Long boardSq) {

		// AnswerService.updateAnswerRecommend 와 같은 401 이어야 FO 의 refresh 인터셉터가
		// 토큰을 재발급해 자동 재시도한다(400 이면 재시도 없이 실패로 끝난다).
		if (userSq == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
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

	/**
	 * 첨부파일 다운로드 권한. <b>비공개 고객의 소리의 첨부만 잠근다</b> — 나머지 게시판은 지금까지처럼 공개다.
	 *
	 * <p>
	 * {@code GET /board/download/{fileSq}} 는 permitAll 이고 fileSq 만 보고 파일을 내주기 때문에,
	 * 이 검사가 없으면 {@code VocService.getVoc} 로 본문을 잠가 놔도 <b>첨부파일은 번호만 맞히면 누구나
	 * 내려받을 수 있다</b>. 본문·답변과 같은 기준을 첨부에도 건다.
	 * </p>
	 */
	public void requireAttachmentReadable(Long fileSq) {
		Long boardSq = boardMapper.findBoardSqByFileSq(fileSq);
		if (boardSq == null) {
			// TBL_COMMON_FILE_S 는 이력서·사업자등록증·프로필 이미지까지 함께 쓰는 공용 테이블이고,
			// 이 엔드포인트는 permitAll 이다. 게시글·답변 어느 쪽에도 붙어 있지 않은 파일을 통과시키면
			// file_sq 를 순차 대입하는 것만으로 남의 이력서가 복호화되어 나간다.
			// 호출처는 게시판·공지·VOC 첨부뿐이므로(FO BoardPost, BO board/notice/voc 드로어)
			// 연결이 없는 파일은 존재를 알리지 않고 404 로 끊는다.
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일 정보가 존재하지 않습니다.");
		}
		// findByIdBoard 는 타입이 맞을 때만 행을 준다 — VOC 가 아니면 null 이라 그대로 통과한다.
		// (boardSq 는 글 첨부·답변 첨부 어느 쪽으로 붙어 있든 같은 글을 가리킨다)
		Board voc = boardMapper.findByIdBoard(boardSq, BoardTypeCode.VOC.getCode());
		if (voc == null || !"Y".equals(voc.getBoardIsSecretYn())) {
			return;
		}
		if (CurrentUser.isAdmin() || Objects.equals(CurrentUser.sq(), voc.getUserSq())) {
			return;
		}
		// 이 엔드포인트는 permitAll 이라 토큰이 없거나 만료돼도 필터를 통과한다. 그 경우 403 을 내면
		// FO 의 refresh 인터셉터(401 에서만 동작)가 돌지 않아, 문의 작성자 본인이 자기 첨부를
		// 못 받는 채로 끝난다. 비로그인/만료는 401, 로그인했지만 남의 글이면 403 으로 가른다.
		if (CurrentUser.sq() == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
		}
		throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비공개 문의의 첨부파일입니다. 작성자와 관리자만 내려받을 수 있습니다.");
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

		Board board = boardMapper.findByIdAny(boardSq);
		if (board == null) {
			throw new IllegalArgumentException("게시글이 존재하지 않습니다.");
		}
		// 채택 상태 변경은 답변을 지원하는 게시판 전용이다(BoardTypeCode.supportsAnswer).
		if (!BoardTypeCode.of(board.getBoardTypeCd()).isSupportsAnswer()) {
			throw new IllegalArgumentException("채택 상태 변경은 답변이 지원되는 게시판에서만 가능합니다.");
		}

		// if (board.getUserSq() != userSq) {
		// throw new IllegalArgumentException("유효하지 않은 접근입니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(board.getUserSq(), userSq)) {
			throw new IllegalArgumentException("유효하지 않은 접근입니다.");
		}

		// Long != long 비교는 언박싱이라 채택상태가 NULL 인 글(BO·시더 유입)에서 NPE 가 났다.
		// NULL 은 '진행중'으로 본다(BoardAdoptStatusCode.labelOf 와 같은 규약).
		Long currentStatus = board.getBoardAdoptStatusCd();
		if (currentStatus != null && !BoardAdoptStatusCode.IN_PROGRESS.getCode().equals(currentStatus)) {
			throw new IllegalArgumentException("채택 상태가 이미 변경되었습니다.");
		}

		// statusCd 는 PathVariable 로 그대로 들어온다. 검증 없이 대입하면
		// PUT /qna/{내 글}/status/9999 로 공통코드에 없는 값이 저장돼 목록 필터·라벨이 전부 어긋나고,
		// 1502(채택완료)를 직접 찍으면 채택된 답변이 0건인 "채택완료" 글이 생긴다.
		if (!BoardAdoptStatusCode.isUserSelectable(statusCd)) {
			throw new IllegalArgumentException("변경할 수 없는 채택 상태입니다.");
		}

		board.setBoardAdoptStatusCd(statusCd);
		boardMapper.update(board);

		return;
	}

}
