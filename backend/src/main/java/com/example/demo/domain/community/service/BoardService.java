package com.example.demo.domain.community.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.community.converter.NormalTagConverter;
import com.example.demo.domain.community.converter.SkillTagConverter;
import com.example.demo.domain.community.dto.BoardAnswerCountDTO;
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
import com.example.demo.domain.community.entity.Comment;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.community.entity.NormalTag;
import com.example.demo.domain.community.entity.Recommendation;
import com.example.demo.domain.community.entity.SkillTag;
import com.example.demo.domain.community.mapper.AnswerMapper;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CmntTagMapper;
import com.example.demo.domain.community.mapper.CommentMapper;
import com.example.demo.domain.community.mapper.CommunityUserMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.dto.UserProfileImageDTO;
import com.example.demo.domain.mypage.repository.InformationEditRepository;
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
    private final FileStorageService fileStorageService;
    private final InformationEditRepository informationEditRepository;
    private final NotificationService notificationService;
    
    // @Value("${cloud.aws.s3.bucket}")
 	// private String bucket;

    @Transactional
    public BoardListResponse getAllBoards(Long boardTypeCd, Long boardAdoptStatusCd, String searchType, String keyword,
            String tag, List<Long> searchSkillTags, String sortType, Long page, Long size) {
        if (page < 1) {
            page = 1L;
        }
        Long offset = (page - 1L) * size;
        if (sortType == null || sortType.isEmpty()) {
            sortType = "latest";
        }

        //게시글 목록
        List<Board> boards = boardMapper.findAll(boardTypeCd, boardAdoptStatusCd, searchType, keyword, tag,
                searchSkillTags, sortType, size, offset);
        Long totalElements = boardMapper.findAllCnt(boardTypeCd, boardAdoptStatusCd, searchType, keyword, tag,
                searchSkillTags);

        //게시글이 없으면 빈 리스트 반환
        if (boards.isEmpty()) {
            return BoardListResponse.builder()
                    .page(page)
                    .size(size)
                    .totalElements(totalElements)
                    .boards(List.of())
                    .build();
        }

        //게시글 PK
        List<Long> boardSqs = boards.stream()
                .map(Board::getBoardSq)
                .toList();

        //작성자 PK
        List<Long> userSqs = boards.stream()
                .map(Board::getUserSq)
                .distinct()
                .toList();

        //태그, 답변, 작성자 한번에 조회
        List<NormalTag> allNormalTags = cmntTagMapper.findNTByBoardSqs(boardSqs);
        List<SkillTag> allSkillTags = cmntTagMapper.findSTByBoardSqs(boardSqs);
        List<BoardAnswerCountDTO> answerCounts = answerMapper.findAnswerCountByBoardSqs(boardSqs);
        List<UserDTO> users = communityUserMapper.findUsersByIds(userSqs);

        //게시글 번호 기준으로 Map
        Map<Long, List<NormalTag>> normalTagMap = allNormalTags.stream()
                .collect(Collectors.groupingBy(NormalTag::getBoardSq));
        Map<Long, List<SkillTag>> skillTagMap = allSkillTags.stream()
                .collect(Collectors.groupingBy(SkillTag::getBoardSq));
        Map<Long, Integer> answerCountMap = answerCounts.stream()
                .collect(Collectors.toMap(BoardAnswerCountDTO::getBoardSq, BoardAnswerCountDTO::getAnswerCnt));
        Map<Long, UserDTO> userMap = users.stream()
                .collect(Collectors.toMap(UserDTO::getUserSq, user -> user));

        //만든 Map을 조회하여 DTO로 정보 반환
        List<BoardListDTO> responses = boards.stream()
                .map(board -> {
                    List<String> normalTags = normalTagConverter.convertNormalTagsToStrings(
                            normalTagMap.getOrDefault(board.getBoardSq(), List.of()));

                    List<SkillTagDTO> skillTags = skillTagConverter.convertSkillTagsToStrings(
                            skillTagMap.getOrDefault(board.getBoardSq(), List.of()));

                    Integer boardAnswerCnt = answerCountMap.getOrDefault(board.getBoardSq(), 0);

                    UserDTO userInfo = userMap.get(board.getUserSq());
                    String userNm = Optional.ofNullable(userInfo)
                            .map(UserDTO::getUserNm)
                            .orElse("존재하지 않는 사용자");

                    return BoardListDTO.fromEntity(board, userNm, boardAnswerCnt, normalTags, skillTags);
                })
                .collect(Collectors.toList());

        return BoardListResponse.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .boards(responses)
                .build();
    }

    @Transactional
    public BoardResponse getBoard(Long userSq, Long boardSq, Long boardTypeCd) {
        Board board = boardMapper.findByIdBoard(boardSq, boardTypeCd);
        if (board == null) {
            throw new IllegalArgumentException("게시글이 존재하지 않습니다.");
        } else if ("Y".equals(board.getBoardIsDeletedYn())) {
            throw new IllegalArgumentException("삭제된 게시글입니다.");
        }

        List<String> normalTags = normalTagConverter.convertNormalTagsToStrings(cmntTagMapper.findNT(boardSq, null));
        List<SkillTagDTO> skillTags = skillTagConverter.convertSkillTagsToStrings(cmntTagMapper.findST(boardSq, null));

        UserDTO boardWriter = communityUserMapper.findById(board.getUserSq());
        String userNm = Optional.ofNullable(boardWriter)
                .map(UserDTO::getUserNm)
                .orElse("존재하지 않는 사용자");

        List<AnswerListResponse> answerListResponses = answerService.getAllAnswers(board.getBoardSq());

        List<Comment> comments = commentMapper.findByBoardSq(boardSq);
        List<Long> commentUserSqs = comments.stream()
                .map(Comment::getUserSq)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<UserDTO> users = communityUserMapper.findUsersByIds(commentUserSqs);
        List<UserProfileImageDTO> profileImages = informationEditRepository.findProfileImagesByUserSqs(commentUserSqs);

        Map<Long, UserDTO> userMap = users.stream()
                .collect(Collectors.toMap(UserDTO::getUserSq, user -> user));

        Map<Long, String> profileImageMap = profileImages.stream()
                .collect(Collectors.toMap(
                        UserProfileImageDTO::getUserSq,
                        image -> "/api/files/" + image.getSavedName()));

        List<CommentResponse> flatComments = comments.stream()
                .filter(Objects::nonNull)
                .map(comment -> {
                    UserDTO commentWriter = userMap.get(comment.getUserSq());
                    String profileImageUrl = profileImageMap.get(comment.getUserSq());
                    return CommentResponse.fromEntity(comment, commentWriter, profileImageUrl);
                })
                .collect(Collectors.toList());

        List<CommentResponse> commentTree = commentService.convertToTree(flatComments);

        List<BoardAttachmentResponse> files = boardMapper.findAttachmentsByBoardSq(boardSq).stream()
                .filter(Objects::nonNull)
                .map(attachment -> BoardAttachmentResponse.builder()
                        .fileSq(attachment.getFileSq())
                        .fileOriginalNm(attachment.getFileOriginalNm())
                        .fileSaveNm(attachment.getFileSaveNm())
                        .build())
                .collect(Collectors.toList());

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

