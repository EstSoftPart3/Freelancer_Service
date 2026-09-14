package com.example.demo.domain.community.service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.management.Notification;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.common.security.CurrentUser;
import com.example.demo.domain.community.constant.BoardAdoptStatusCode;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.converter.NormalTagConverter;
import com.example.demo.domain.community.converter.SkillTagConverter;
import com.example.demo.domain.community.dto.SkillTagDTO;
import com.example.demo.domain.community.dto.request.AnswerRequest;
import com.example.demo.domain.community.dto.response.AnswerListResponse;
import com.example.demo.domain.community.dto.response.AnswerResponse;
import com.example.demo.domain.community.dto.response.BoardAttachmentResponse;
import com.example.demo.domain.community.dto.response.CommentResponse;
import com.example.demo.domain.community.entity.Answer;
import com.example.demo.domain.community.entity.Board;
import com.example.demo.domain.community.entity.BoardAttachment;
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
import com.example.demo.domain.user.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnswerService {

	private final AnswerMapper answerMapper;
	private final CmntTagMapper cmntTagMapper;
	private final CommentMapper commentMapper;
	private final CommentService commentService; // [추가] 트리 변환 로직 사용을 위해 주입
	private final NormalTagConverter normalTagConverter;
	private final SkillTagConverter skillTagConverter;
	private final RecommendationMapper recommendationMapper;
	private final CommunityUserMapper communityUserMapper;
	private final BoardMapper boardMapper;
	// private final AmazonS3Service amazonS3Service;
	private final FileStorageService fileStorageService;
	private final InformationEditRepository informationEditRepository;
	private final InformationEditService informationEditService;
	private final NotificationService notificationService;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	// 답변 리스트
	@Transactional
	public List<AnswerListResponse> getAllAnswers(Long boardSq) {
		List<Answer> answers = answerMapper.findAll(boardSq);

		List<AnswerListResponse> responses = answers.stream()
				.filter(Objects::nonNull)
				.map(answer -> {
					if (answer.getAnswerIsDeletedYn().equals("Y")) {
						return AnswerListResponse.builder().isDeletedYn("Y").build();
					} else {
						UserDTO userInfo = communityUserMapper.findById(answer.getUserSq());
						String userNickname = "탈퇴한 사용자";
						if (userInfo != null && userInfo.getUserNickname() != null) {
							userNickname = userInfo.getUserNickname();
						}

						return AnswerListResponse.fromEntity(answer, userNickname);
					}
				})
				.collect(Collectors.toList());

		return responses;
	}

	/**
	 * 비공개 고객의 소리(VOC)에 달린 답변인지 확인하고, 그렇다면 작성자·관리자만 통과시킨다.
	 *
	 * <p>
	 * {@code findByIdBoard} 는 타입이 맞을 때만 행을 돌려주므로 VOC 가 아닌 글이면 null 이고,
	 * 게시판·Q&amp;A 답변은 지금까지처럼 그대로 공개된다.
	 * </p>
	 */
	private void requireAnswerReadable(Long boardSq) {
		Board voc = boardMapper.findByIdBoard(boardSq, BoardTypeCode.VOC.getCode());
		if (voc == null || !"Y".equals(voc.getBoardIsSecretYn())) {
			return;
		}
		if (CurrentUser.isAdmin() || Objects.equals(CurrentUser.sq(), voc.getUserSq())) {
			return;
		}
		// GET /answer/{sq} 는 permitAll 이라 토큰이 없거나 만료돼도 여기까지 온다. 403 을 내면
		// FO 의 refresh 인터셉터(401 에서만 동작)가 돌지 않아 문의 작성자 본인이 자기 답변을
		// 못 보는 채로 끝난다(BoardService.requireAttachmentReadable 과 같은 규약).
		if (CurrentUser.sq() == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
		}
		throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비공개 문의의 답변입니다. 작성자와 관리자만 볼 수 있습니다.");
	}

	// 답변 하나 조회
	@Transactional
	public AnswerResponse getAnswer(Long answerSq) {
		Answer answer = answerMapper.findById(answerSq);
		if (answer == null) {
			throw new IllegalArgumentException("답변이 존재하지 않습니다.");
		} else if (answer.getAnswerIsDeletedYn().equals("Y")) {
			throw new IllegalArgumentException("삭제된 답변입니다.");
		}

		// GET /answer/{sq} 는 permitAll 이라 글 종류를 보지 않으면 비공개 문의(VOC)에 달린
		// 운영자 답변 본문이 answerSq 만 알면 누구에게나 읽힌다. VocService.getVoc 의
		// 권한 검사와 같은 기준을 여기에도 건다.
		requireAnswerReadable(answer.getBoardSq());

		List<String> normalTags = normalTagConverter.convertNormalTagsToStrings(cmntTagMapper.findNT(null, answerSq));
		List<SkillTagDTO> skillTags = skillTagConverter.convertSkillTagsToStrings(cmntTagMapper.findST(null, answerSq));

		UserDTO userInfo = communityUserMapper.findById(answer.getUserSq());
		String userNickname = Optional.ofNullable(userInfo)
				.map(UserDTO::getUserNickname)
				.orElse("탈퇴한 사용자");

		// --- [댓글 조회 및 트리 구조 변환 로직 시작] ---

		// 1. 답변에 달린 모든 댓글 조회 (평면 리스트)
		List<CommentResponse> flatComments = commentMapper.findByAnswerSq(answerSq).stream()
				.filter(Objects::nonNull)
				.map(comment -> {
					UserDTO userDto = communityUserMapper.findById(comment.getUserSq());
					// 탈퇴 회원은 findById 가 null 을 돌려준다(쿼리에 user_is_deleted_yn = 'N' 이 걸려 있다).
					// 여기서 바로 getUserSq() 를 부르면 댓글 한 건 때문에 답변 상세 전체가 500 이 난다.
					String profileImageUrl = userDto != null
							? informationEditService.getProfileImageUrl(userDto.getUserSq())
							: null;
					return CommentResponse.fromEntity(comment, userDto, profileImageUrl);
				})
				.collect(Collectors.toList());

		// 2. [핵심] CommentService를 사용하여 계층형 트리 구조로 변환
		List<CommentResponse> commentTree = commentService.convertToTree(flatComments);

		// --- [댓글 조회 및 트리 구조 변환 로직 종료] ---

		// 게시글의 첨부파일 조회
		List<Long> fileSqs = answerMapper.findFiles(answerSq);
		List<BoardAttachmentResponse> files = fileSqs.stream().filter(Objects::nonNull).map(fileSq -> {
			BoardAttachment attachment = boardMapper.findFile(fileSq);
			BoardAttachmentResponse file = BoardAttachmentResponse.builder().fileSq(attachment.getFileSq())
					.fileOriginalNm(attachment.getFileOriginalNm())
					.fileSaveNm(attachment.getFileSaveNm())
					.build();
			return file;
		}).collect(Collectors.toList());

		// 변환된 commentTree를 최종 응답에 담아 반환
		return AnswerResponse.fromEntity(answer, userNickname, normalTags, skillTags, commentTree, files);
	}

	// 답변 등록
	@Transactional
	public void createAnswer(AnswerRequest answerRequest) {
		// BoardService.requireWriter 와 같은 이유의 가드다. /api/answer 는
		// JwtAuthenticationFilter.EXCLUDE_URLS 에 들어 있어 토큰 없는 POST 도 필터를 통과하고,
		// 그대로 두면 user_sq = NULL 로 INSERT 가 내려가 SQL 예외가 500 + 원본 스택으로 노출된다.
		// 401 이어야 FO 의 refresh 인터셉터가 토큰을 재발급해 자동 재시도한다.
		if (answerRequest.getUserSq() == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
		}

		// 게시글 오류 처리
		if (answerRequest.getTtl() == null) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		} else if (answerRequest.getDescription() == null) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		// 고객의 소리는 이용자↔운영자 1:1 창구다. 막지 않으면 아무 로그인 사용자나 남의(비공개
		// 문의 포함) 문의에 답변을 달 수 있고, 문의자에게는 2607("내 문의에 답변이 등록되었습니다")
		// 알림까지 나가 운영자 답변으로 오인된다.
		Board vocTarget = boardMapper.findByIdBoard(answerRequest.getBoardSq(), BoardTypeCode.VOC.getCode());
		if (vocTarget != null && !CurrentUser.isAdmin()) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "고객의 소리 답변은 운영자만 등록할 수 있습니다.");
		}

		Answer answer = Answer.builder()
				.userSq(answerRequest.getUserSq())
				.boardSq(answerRequest.getBoardSq())
				.answerTtl(answerRequest.getTtl())
				.answerDescriptionEdt(answerRequest.getDescription()).build();
		answerMapper.insert(answer);

		// ================= [ 알림 발송 로직 추가 ] =================
		// 원본 Q&A 게시글 정보를 조회하여 질문자(수신자)를 찾습니다.
		Board board = boardMapper.findByIdOnly(answer.getBoardSq());

		if (board != null) {
			Long questionerSq = board.getUserSq(); // 질문자 SQ

			// 본인 질문에 본인이 답변을 단 경우가 아니라면 알림 발송
			if (!questionerSq.equals(answer.getUserSq())) {
				// 답변은 Q&A와 고객의 소리(VOC)가 공유한다. 알림 타입·문구·링크만 갈린다.
				// VOC 상세에는 답변 모달이 없으므로 answerSq 쿼리를 붙이지 않는다.
				boolean isVoc = BoardTypeCode.VOC.getTyp().equals(board.getBoardTyp());
				String targetUrl = BoardTypeCode.pathPrefixOfTyp(board.getBoardTyp()) + board.getBoardSq();

				notificationService.send(
						questionerSq, // 수신자: 질문자/문의자
						answer.getUserSq(), // 발신자: 답변자
						isVoc ? 2607L : 2605L, // 타입: 고객의소리 답변 / Q&A 답변
						isVoc ? "내 문의에 답변이 등록되었습니다." : "내 질문에 새로운 답변이 등록되었습니다.",
						isVoc ? targetUrl : targetUrl + "?answerSq=" + answer.getAnswerSq());
			}
		}
		// =======================================================

		if (answer.getAnswerSq() == null) {
			throw new IllegalStateException("게시글 등록 실패하였습니다.");
		}

		// 일반 태그 추가
		// 태그는 선택 입력이라 @ModelAttribute 에 실려 오지 않으면 null 이다. 아래 첨부파일 처리처럼
		// null 을 먼저 걸러야 한다 — 태그 없이 답변을 달면 여기서 NPE 500 이 났다.
		if (answerRequest.getNormalTags() != null && !answerRequest.getNormalTags().isEmpty()) {
			cmntTagMapper.insertNT(normalTagConverter.convertStringsToNormalTags(null, answer.getAnswerSq(),
					answerRequest.getNormalTags()));
		}

		// 스킬태그 추가
		if (answerRequest.getSkillTags() != null && !answerRequest.getSkillTags().isEmpty()) {
			cmntTagMapper.insertST(skillTagConverter.convertStringsToSkillTags(null, answer.getAnswerSq(),
					answerRequest.getSkillTags()));
		}

		// 첨부파일 업로드
		if (answerRequest.getFiles() != null) {
			for (MultipartFile file : answerRequest.getFiles()) {

				// UploadedFileDTO uploaded = amazonS3Service.uploadFile(file);
				UploadedFileDTO uploaded = fileStorageService.uploadFile(file);

				ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
						.originalName(uploaded.getOriginalName())
						.savedName(uploaded.getSavedName())
						.contentType(uploaded.getContentType())
						.size(uploaded.getSize())
						.build();

				informationEditRepository.saveFile(fileInfo);
				answerMapper.insertFile(answer.getAnswerSq(), fileInfo.getFileSq());
			}
		}

		return;
	}

	// 답변 수정
	@Transactional
	public void updateAnswer(AnswerRequest answerRequest, Long answerSq) {
		// 게시글 업데이트
		if (answerRequest.getTtl() == null) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		} else if (answerRequest.getDescription() == null) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		Answer answer = answerMapper.findById(answerSq);
		// 없는 답변 번호로 수정 요청이 오면 아래 getUserSq() 에서 NPE 500 이 났다.
		if (answer == null || "Y".equals(answer.getAnswerIsDeletedYn())) {
			throw new IllegalArgumentException("답변이 존재하지 않습니다.");
		}

		// if (answer.getUserSq() != answerRequest.getUserSq()) {
		// throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(answer.getUserSq(), answerRequest.getUserSq())) {
			throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
		}

		answer.setAnswerTtl(answerRequest.getTtl());
		answer.setAnswerDescriptionEdt(answerRequest.getDescription());

		answerMapper.update(answer);

		// 기존 태그 삭제
		cmntTagMapper.deleteNT(null, answer.getAnswerSq());
		cmntTagMapper.deleteST(null, answer.getAnswerSq());

		// 일반 태그 추가
		if (answerRequest.getNormalTags() != null && !answerRequest.getNormalTags().isEmpty()) {
			cmntTagMapper.insertNT(normalTagConverter.convertStringsToNormalTags(null, answer.getAnswerSq(),
					answerRequest.getNormalTags()));
		}
		// 스킬태그 추가
		if (answerRequest.getSkillTags() != null && !answerRequest.getSkillTags().isEmpty()) {
			cmntTagMapper.insertST(skillTagConverter.convertStringsToSkillTags(null, answer.getAnswerSq(),
					answerRequest.getSkillTags()));
		}

		// 첨부파일
		// 기존 첨부파일 변동 여부 확인
		List<Long> fileSqs = answerMapper.findFiles(answer.getAnswerSq());
		List<Long> clientFileSqs = answerRequest.getAttachments();
		Set<Long> clientFileSqSet = new HashSet<>(clientFileSqs);
		List<Long> deletedFileSqs = fileSqs.stream()
				.filter(fileSq -> !clientFileSqSet.contains(fileSq))
				.collect(Collectors.toList());
		for (Long fileSq : deletedFileSqs) {
			deleteFile(answer.getAnswerSq(), fileSq);
		}

		// 새로운 첨부파일 추가
		// 첨부파일 업로드
		if (answerRequest.getFiles() != null) {
			for (MultipartFile file : answerRequest.getFiles()) {

				// UploadedFileDTO uploaded = amazonS3Service.uploadFile(file);
				UploadedFileDTO uploaded = fileStorageService.uploadFile(file);

				ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
						.originalName(uploaded.getOriginalName())
						.savedName(uploaded.getSavedName())
						.contentType(uploaded.getContentType())
						.size(uploaded.getSize())
						.build();

				informationEditRepository.saveFile(fileInfo);
				answerMapper.insertFile(answer.getAnswerSq(), fileInfo.getFileSq());
			}
		}

		return;
	}

	// 답변 삭제
	@Transactional
	public void deleteAnswer(Long userSq, Long answerSq) {
		// delete 쿼리만 user_sq 로 걸려 있고 아래 세 개의 정리 쿼리는 answer_sq 만 본다.
		// 소유자 확인 없이 내려가면 남의 답변 번호로 호출했을 때 답변은 그대로 남은 채
		// 태그와 추천 기록만 지워진다(BoardService.deleteBoard 와 같은 이유로 막는다).
		Answer answer = answerMapper.findById(answerSq);
		if (answer == null || "Y".equals(answer.getAnswerIsDeletedYn())) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 답변입니다.");
		}
		if (!Objects.equals(answer.getUserSq(), userSq)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 답변만 삭제할 수 있습니다.");
		}

		answerMapper.delete(userSq, answerSq);
		cmntTagMapper.deleteNT(null, answerSq);
		cmntTagMapper.deleteST(null, answerSq);
		recommendationMapper.deleteAll(null, answerSq, null);

	}

	// 조회수 증가
	@Transactional
	public void addViewCntAnswer(Long answerSq) {
		answerMapper.addViewCnt(answerSq);
	}

	// 추천
	@Transactional
	public void updateAnswerRecommend(Long userSq, Long answerSq) {

		// BoardService.updateBoardRecommend 와 같은 가드. 없으면 비로그인 호출이
		// user_sq = NULL 인 추천 행을 INSERT 하려다 SQL 예외 500 으로 끝난다.
		if (userSq == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
		}

		Recommendation recommendation = recommendationMapper.findByAnswerSq(userSq, answerSq);

		if (recommendation == null) {
			recommendation = Recommendation.builder().answerSq(answerSq).userSq(userSq).recommendationTypeCd(1902L)
					.build();
			recommendationMapper.insert(recommendation);

		} else {
			recommendationMapper.delete(recommendation.getRecommendationSq());
		}

		answerMapper.updateRecommendCnt(answerSq);

		return;

	}

	// 답변 채택
	@Transactional
	public void adoptAnswer(Long userSq, Long answerSq) {

		Answer answer = answerMapper.findById(answerSq);
		if (answer == null) {
			throw new IllegalArgumentException("답변이 존재하지 않습니다.");
		}
		Board board = boardMapper.findByIdAny(answer.getBoardSq());
		if (board == null) {
			throw new IllegalArgumentException("게시글이 존재하지 않습니다.");
		}
		// 채택은 답변을 지원하는 게시판 전용이다(BoardTypeCode.supportsAnswer).
		// 이 검사를 findByIdBoard 로 미리 걸러 두면(예전 방식) 지원 게시판 목록이 늘 때마다
		// 여기 조회 조건까지 고쳐야 했다.
		if (!BoardTypeCode.of(board.getBoardTypeCd()).isSupportsAnswer()) {
			throw new IllegalArgumentException("채택은 답변이 지원되는 게시판에서만 가능합니다.");
		}

		// if (board.getUserSq() != userSq) {
		// throw new IllegalArgumentException("유효하지 않은 접근입니다.");
		// }

		// sq 비교 방식 변경
		if (!Objects.equals(board.getUserSq(), userSq)) {
			throw new IllegalArgumentException("유효하지 않은 접근입니다.");
		}
		// Long == long 비교는 언박싱이라 채택상태가 NULL 인 글(BO·시더로 들어온 글)에서 NPE 가 난다.
		if (BoardAdoptStatusCode.ADOPTED.getCode().equals(board.getBoardAdoptStatusCd())) {
			throw new IllegalArgumentException("이미 채택된 답변이 있습니다.");
		}

		board.setBoardAdoptStatusCd(BoardAdoptStatusCode.ADOPTED.getCode());
		boardMapper.update(board);

		answer.setAnswerIsAdoptedYn("Y");

		answerMapper.update(answer);

		return;
	}

	// 첨부파일 삭제
	@Transactional
	public void deleteFile(Long answerSq, Long fileSq) {
		// 1. DB에서 파일 정보 먼저 조회 (물리 파일명을 알기 위해)
		BoardAttachment attachment = boardMapper.findFile(fileSq);

		if (attachment != null) {
			// 2. 로컬 하드디스크에서 물리 파일 삭제
			fileStorageService.deleteFile(attachment.getFileSaveNm());
		}

		// 3. DB 매핑 삭제 및 파일 레코드 논리 삭제 (기존 로직)
		answerMapper.deleteAnswerFile(answerSq, fileSq);
	}

}
