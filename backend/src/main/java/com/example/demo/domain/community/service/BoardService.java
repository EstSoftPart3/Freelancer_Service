package com.example.demo.domain.community.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.admin.dto.AuditLogEventDTO;
import com.example.demo.domain.community.converter.NormalTagConverter;
import com.example.demo.domain.community.converter.SkillTagConverter;
import com.example.demo.domain.community.dto.BoardListDTO;
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
import com.fasterxml.jackson.databind.ObjectMapper;

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
	
	private final ApplicationEventPublisher eventPublisher;
	private final ObjectMapper objectMapper;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	@Transactional
	public BoardListResponse getAllBoards(Long boardTypeCd, Long boardAdoptStatusCd, String searchType, String keyword,
			String tag,
			List<Long> searchSkillTags, String sortType, Long page, Long size) {
		if (page < 1)
			page = 1L;
		Long offset = (page - 1L) * size;
		if (sortType == null || sortType.isEmpty())
			sortType = "latest";

		List<Board> boards = boardMapper.findAll(boardTypeCd, boardAdoptStatusCd, searchType, keyword, tag,
				searchSkillTags,
				sortType, size, offset);
		Long totalElements = boardMapper.findAllCnt(boardTypeCd, boardAdoptStatusCd, searchType, keyword, tag,
				searchSkillTags);

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
					String userNm = Optional.ofNullable(userInfo)
							.map(UserDTO::getUserNm)
							.orElse("존재하지 않는 사용자");

					// BoardListResponse 생성 (태그 포함)
					return BoardListDTO.fromEntity(board, userNm, boardAnswerCnt, normalTags, skillTags);
				})
				.collect(Collectors.toList());

		return BoardListResponse.builder().page(page).size(size).totalElements(totalElements).boards(responses).build();
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
		String userNm = Optional.ofNullable(userInfo)
				.map(UserDTO::getUserNm)
				.orElse("존재하지 않는 사용자");

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
		return BoardResponse.fromEntity(board, userNm, normalTags, skillTags, answerListResponses, commentTree, userSq,
				files);
	}

	@Transactional
	public void createBoard(BoardRequest boardRequest, Long BoardTypeCd) {
		// 게시글 오류 처리
		if (boardRequest.getTtl() == null) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		} else if (boardRequest.getDescription() == null) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		String typeStr = "normal";
		if (BoardTypeCd == 1402L) {
			typeStr = "qna";
		} else if (BoardTypeCd == 1403L) {
			typeStr = "notice";
		}

		Board board = Board.builder()
				.userSq(boardRequest.getUserSq())
				.boardTtl(boardRequest.getTtl())
				.boardDescriptionEdt(boardRequest.getDescription())
				.boardTyp(typeStr)
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
		try {
			UserDTO userInfo = communityUserMapper.findById(board.getUserSq());
			String userType = (userInfo.getUserTypeCd() != null && userInfo.getUserTypeCd() == 301L) ? "개인" : "기업";
			java.util.Map<String, Object> dataMap = new java.util.HashMap<>();
			dataMap.put("제목", board.getBoardTtl());
			dataMap.put("내용", board.getBoardDescriptionEdt() != null ? board.getBoardDescriptionEdt().replaceAll("<[^>]*>", "") : "");
			String afterJson = objectMapper.writeValueAsString(dataMap);
			
			eventPublisher.publishEvent(AuditLogEventDTO.builder()
					.userTypeCd(userType)
					.userNm(userInfo.getUserNm())
					.actionType("CREATE")
					.targetType("게시글")
					.targetTitle(board.getBoardTtl())
					.ipAddress("0.0.0.0")
					.beforeDataTxt(null)
					.afterDataTxt(afterJson)
					.build());
		} catch (Exception e) {
			log.error("게시글 생성 로그 발생 실패: {}", e.getMessage());
		}
		return;
	}

	@Transactional
	public void updateBoard(BoardRequest boardRequest, Long boardSq, Long boardTypeCd) {
		// 게시글 업데이트
		if (boardRequest.getTtl() == null) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		} else if (boardRequest.getDescription() == null) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}
		
		
		Board board = boardMapper.findByIdBoard(boardSq, boardTypeCd);
		
		String beforeJson = null;
		try {
			java.util.Map<String, Object> beforeMap = new java.util.HashMap<>();
			beforeMap.put("제목", board.getBoardTtl());
			beforeMap.put("내용", board.getBoardDescriptionEdt() != null ? board.getBoardDescriptionEdt().replaceAll("<[^>]*>",""): "");
			beforeJson = objectMapper.writeValueAsString(beforeMap);
		} catch (Exception e) {}
		
		// if (board.getUserSq() != boardRequest.getUserSq()) {
		// throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(board.getUserSq(), boardRequest.getUserSq())) {
			throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		}

		board.setBoardTtl(boardRequest.getTtl());
		board.setBoardDescriptionEdt(boardRequest.getDescription());

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
		
		
		
		try {
			UserDTO userInfo = communityUserMapper.findById(board.getUserSq());
			String userType = (userInfo.getUserTypeCd() != null && userInfo.getUserTypeCd() == 301L) ? "개인" : "기업";
			java.util.Map<String, Object> afterMap = new java.util.HashMap<>();
			afterMap.put("제목", board.getBoardTtl());
			afterMap.put("내용", board.getBoardDescriptionEdt()!= null ? board.getBoardDescriptionEdt().replaceAll("<[^>]*>", "") : "");
			String afterJson = objectMapper.writeValueAsString(afterMap);
			
			eventPublisher.publishEvent(AuditLogEventDTO.builder()
					.userTypeCd(userType)
					.userNm(userInfo.getUserNm())
					.actionType("UPDATE")
					.targetType("게시글")
					.targetTitle(board.getBoardTtl())
					.ipAddress("0.0.0.0")
					.beforeDataTxt(beforeJson)
					.afterDataTxt(afterJson)
					.build());
		} catch (Exception e) {
			log.error("게시글 수정 로그 발생 실패: {}", e.getMessage());
		}
		
		
		
		return;
	}

	@Transactional
	public void deleteBoard(Long userSq, Long boardSq) {
		
		try {
			UserDTO userInfo = communityUserMapper.findById(userSq);
			String userType = (userInfo.getUserTypeCd() != null && userInfo.getUserTypeCd() == 301L) ? "개인" : "기업";
			
			Board oldBoard = boardMapper.findByIdOnly(boardSq);
			String boardTitle = (oldBoard != null) ? oldBoard.getBoardTtl() : "삭제된 게시글";
			
			String beforeJson = null;
			
			if (oldBoard != null) {
				java.util.Map<String, Object> beforeMap = new java.util.HashMap<>();
				beforeMap.put("제목", oldBoard.getBoardTtl());
				beforeMap.put("내용", oldBoard.getBoardDescriptionEdt() != null ? oldBoard.getBoardDescriptionEdt().replaceAll("<[^>]*>", "") : "");
				beforeJson = objectMapper.writeValueAsString(beforeMap);
			}
			
			eventPublisher.publishEvent(AuditLogEventDTO.builder()
					.userTypeCd(userType)
					.userNm(userInfo.getUserNm())
					.actionType("DELETE")
					.targetType("게시글")
					.targetTitle(boardTitle)
					.ipAddress("0.0.0.0")
					.beforeDataTxt(beforeJson)
					.afterDataTxt("{\"boardSq\": " + boardSq + ", \"status\":\"DELETED\"}")
					.build());
		} catch(Exception e) {
			log.error("게시글 삭제 로그 발행 실패: {}", e.getMessage());
		}
		
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
