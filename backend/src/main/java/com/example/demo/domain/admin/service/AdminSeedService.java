package com.example.demo.domain.admin.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.admin.dto.SeedAnswerInsertDTO;
import com.example.demo.domain.admin.dto.SeedAuthorDTO;
import com.example.demo.domain.admin.dto.SeedBoardInsertDTO;
import com.example.demo.domain.admin.dto.SeedCommentInsertDTO;
import com.example.demo.domain.admin.dto.request.SeedCommunityRequestDTO;
import com.example.demo.domain.admin.dto.request.SeedRevokeRequestDTO;
import com.example.demo.domain.admin.dto.response.SeedCommitResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedRevokeResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedRevokeSampleDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanAnswerDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanCommentDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanRowDTO;
import com.example.demo.domain.admin.mapper.AdminSeedMapper;
import com.example.demo.domain.admin.service.seed.SeedPlanner;
import com.example.demo.domain.community.constant.BoardAdoptStatusCode;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.mapper.AnswerMapper;
import com.example.demo.domain.community.mapper.BoardMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 커뮤니티 더미데이터 시드.
 *
 * <p>
 * 외부 AI 가 만든 콘텐츠를 관리자가 붙여넣으면, 서버가 작성자·작성일시·카테고리·채택상태를
 * 배분해 등록한다. <b>미리보기와 등록이 같은 {@link SeedPlanner#plan} 을 부르고</b>, 등록은
 * 그 결과를 그대로 기록하기 때문에 화면에서 본 것과 다른 값이 저장되는 일이 없다.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSeedService {

	/** 한 INSERT 문에 담을 댓글 수. 너무 크면 max_allowed_packet 에 걸린다. */
	private static final int COMMENT_BATCH_SIZE = 200;

	/** 공통코드 1600 하위 — 1601 게시글 댓글 / 1602 답변 댓글. */
	private static final Long COMMENT_TYPE_BOARD = 1601L;
	private static final Long COMMENT_TYPE_ANSWER = 1602L;

	/** 회수 화면에 보여줄 표본 수. 숫자만 보여주면 무엇이 지워지는지 알 수 없다. */
	private static final int REVOKE_SAMPLE_LIMIT = 20;

	private final SeedPlanner seedPlanner;
	private final AdminSeedMapper adminSeedMapper;
	private final CommonCodeMapper commonCodeMapper;
	/** 회수 후 댓글 수 재집계에 기존 재집계 쿼리를 그대로 쓴다 (둘 다 COUNT 기반이라 정확하다). */
	private final BoardMapper boardMapper;
	private final AnswerMapper answerMapper;

	/**
	 * 배분 계획을 만든다. DB 에 아무것도 쓰지 않는다.
	 *
	 * <p>
	 * 등록도 같은 메서드를 부른 뒤 결과를 기록하므로, 두 요청이 <b>같은 {@code randomSeed} 와
	 * {@code plannedAt}</b> 을 쓰면 결과가 완전히 같다.
	 * </p>
	 */
	@Transactional(readOnly = true)
	public SeedPlanResponseDTO plan(SeedCommunityRequestDTO request) {
		return buildPlan(request);
	}

	/**
	 * 계획을 실제로 기록한다.
	 *
	 * <p>
	 * 청크(요청당 최대 50건) 하나가 트랜잭션 하나다. 200건 전체를 한 트랜잭션으로 묶지 않는 이유는
	 * <b>원격 공용 DB</b> 이기 때문이다 — 수백 회 왕복 동안 트랜잭션을 열어두면 다른 세션과 락 경합이
	 * 생긴다. 대신 부분 성공이 남을 수 있고, 그래서 회수 기능이 먼저 완성돼 있어야 한다.
	 * </p>
	 */
	@Transactional
	public SeedCommitResponseDTO commit(SeedCommunityRequestDTO request) {
		if (request.getPlannedAt() == null) {
			// plannedAt 이 없으면 서버가 "지금"으로 채우는데, 그러면 미리보기와 다른 결과가 저장된다.
			// 화면에서 확인한 것과 같은 것이 들어간다는 보장이 깨지므로 등록 경로에서는 거절한다.
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"미리보기를 먼저 실행한 뒤 등록해주세요. (plannedAt 이 없으면 미리보기와 다른 결과가 저장됩니다)");
		}

		SeedPlanResponseDTO plan = buildPlan(request);

		List<Long> boardSqs = new ArrayList<>();
		List<SeedCommentInsertDTO> comments = new ArrayList<>();
		int insertedAnswers = 0;

		for (SeedPlanRowDTO row : plan.getRows()) {
			Long boardSq = insertBoard(row);
			boardSqs.add(boardSq);

			for (SeedPlanCommentDTO comment : row.getComments()) {
				comments.add(toComment(comment, boardSq, null, COMMENT_TYPE_BOARD));
			}

			for (SeedPlanAnswerDTO answer : row.getAnswers()) {
				Long answerSq = insertAnswer(answer, boardSq);
				insertedAnswers++;
				for (SeedPlanCommentDTO comment : answer.getComments()) {
					comments.add(toComment(comment, null, answerSq, COMMENT_TYPE_ANSWER));
				}
			}
		}

		insertCommentsInChunks(comments);

		log.info("[seed] 등록 완료 게시글={} 답변={} 댓글={} boardSq={}~{}",
				boardSqs.size(), insertedAnswers, comments.size(),
				boardSqs.isEmpty() ? "-" : boardSqs.get(0),
				boardSqs.isEmpty() ? "-" : boardSqs.get(boardSqs.size() - 1));

		return SeedCommitResponseDTO.builder()
				.insertedBoards(boardSqs.size())
				.insertedAnswers(insertedAnswers)
				.insertedComments(comments.size())
				.boardSqs(boardSqs)
				.executedAt(LocalDateTime.now())
				.summary(plan.getSummary())
				.warnings(plan.getWarnings())
				.build();
	}

	/** 회수 미리보기. 무엇이 얼마나 내려가는지만 보여주고 아무것도 지우지 않는다. */
	@Transactional(readOnly = true)
	public SeedRevokeResponseDTO revokePreview(SeedRevokeRequestDTO request) {
		return doRevoke(request, false);
	}

	/** 회수 실행. */
	@Transactional
	public SeedRevokeResponseDTO revoke(SeedRevokeRequestDTO request) {
		return doRevoke(request, true);
	}

	/**
	 * 회수 본체.
	 *
	 * <p>
	 * <b>순서가 전부다.</b>
	 * <ol>
	 * <li>미리보기 표본을 <b>먼저</b> 뽑는다 — 지운 뒤에는 대상 조건에 걸리지 않아 못 찾는다.</li>
	 * <li>재집계 대상을 <b>먼저</b> 확보한다 — 같은 이유다.</li>
	 * <li>댓글 → 답변 → 게시글 순으로 지운다 — 역순이면 상위가 사라진 뒤 하위를 못 찾는다.</li>
	 * <li>살아남은 글·답변의 댓글 수를 다시 센다.</li>
	 * </ol>
	 * </p>
	 */
	private SeedRevokeResponseDTO doRevoke(SeedRevokeRequestDTO request, boolean execute) {
		List<Long> userSqs = resolveAuthors(request.getUserSqs()).stream()
				.map(SeedAuthorDTO::getUserSq)
				.toList();

		List<Long> boardSqs = (request.getBoardSqs() == null || request.getBoardSqs().isEmpty())
				? null
				: request.getBoardSqs();
		// 게시글 번호를 주지 않으면 대상 계정이 쓴 것 전부가 내려간다.
		boolean wide = boardSqs == null;

		LocalDateTime from = request.getCreatedFrom();
		LocalDateTime to = request.getCreatedTo();

		List<SeedRevokeSampleDTO> samples = adminSeedMapper.findRevokeSamples(userSqs, boardSqs, from, to,
				REVOKE_SAMPLE_LIMIT);

		if (!execute) {
			return SeedRevokeResponseDTO.builder()
					.executed(false)
					.wide(wide)
					.boards(adminSeedMapper.countRevokeBoards(userSqs, boardSqs, from, to))
					.answers(adminSeedMapper.countRevokeAnswers(userSqs, boardSqs, from, to))
					.comments(adminSeedMapper.countRevokeComments(userSqs, boardSqs, from, to, wide))
					.samples(samples)
					.build();
		}

		// 봇이 "남의 글" 에 단 댓글이 지워지면 그 글은 살아남지만 댓글 수는 틀리게 된다.
		// 정밀 회수(게시글 지정)는 남의 글을 건드리지 않으므로 이 조회 자체가 불필요하다.
		List<Long> recalcBoardSqs = wide
				? adminSeedMapper.findRecalcBoardSqs(userSqs, boardSqs, from, to)
				: List.of();
		List<Long> recalcAnswerSqs = wide
				? adminSeedMapper.findRecalcAnswerSqs(userSqs, boardSqs, from, to)
				: List.of();

		int deletedComments = adminSeedMapper.softDeleteRevokeComments(userSqs, boardSqs, from, to, wide);
		int deletedAnswers = adminSeedMapper.softDeleteRevokeAnswers(userSqs, boardSqs, from, to);
		int deletedBoards = adminSeedMapper.softDeleteRevokeBoards(userSqs, boardSqs, from, to);

		recalcBoardSqs.forEach(boardMapper::updateCommentCnt);
		recalcAnswerSqs.forEach(answerMapper::updateCommentCnt);

		log.info("[seed] 회수 완료 wide={} 게시글={} 답변={} 댓글={} 재집계(글/답변)={}/{}",
				wide, deletedBoards, deletedAnswers, deletedComments,
				recalcBoardSqs.size(), recalcAnswerSqs.size());

		return SeedRevokeResponseDTO.builder()
				.executed(true)
				.wide(wide)
				.boards(deletedBoards)
				.answers(deletedAnswers)
				.comments(deletedComments)
				.recalculatedBoards(recalcBoardSqs.size())
				.recalculatedAnswers(recalcAnswerSqs.size())
				.samples(samples)
				.build();
	}

	private SeedPlanResponseDTO buildPlan(SeedCommunityRequestDTO request) {
		LocalDateTime reference = resolveReferenceTime(request.getPlannedAt());
		List<SeedAuthorDTO> authors = resolveAuthors(request.getOptions().getAuthorUserSqs());
		List<CommonCodeDTO> categories = commonCodeMapper
				.findActiveChildrenByParent(ParentCodeEnum.BOARD_CATEGORY.getCode());

		return seedPlanner.plan(request, authors, categories, reference);
	}

	private Long insertBoard(SeedPlanRowDTO row) {
		SeedBoardInsertDTO board = SeedBoardInsertDTO.builder()
				.userSq(row.getUserSq())
				.boardTtl(row.getTitle())
				.boardDescriptionEdt(row.getBodyHtml())
				.boardTypeCd(row.getBoardTypeCd())
				.boardTyp(BoardTypeCode.typOf(row.getBoardTypeCd()))
				.boardCategoryCd(row.getCategoryCd())
				// 일반게시판은 채택 개념이 없다. 기존 INSERT 도 전부 1501 을 넣으므로 같은 값을 유지한다.
				.boardAdoptStatusCd(row.getAdoptStatusCd() != null
						? row.getAdoptStatusCd()
						: BoardAdoptStatusCode.IN_PROGRESS.getCode())
				.boardViewCnt(row.getViewCnt())
				.boardCommentCnt(row.getComments().size())
				.boardCreatedAtDtm(row.getCreatedAt())
				.build();

		adminSeedMapper.insertSeedBoard(board);

		if (board.getBoardSq() == null) {
			// 생성키를 못 받으면 이후 답변·댓글이 전부 엉뚱한 곳에 붙는다. 여기서 끊는 편이 낫다.
			throw new IllegalStateException("게시글 생성키를 받지 못했습니다: " + row.getTitle());
		}
		return board.getBoardSq();
	}

	private Long insertAnswer(SeedPlanAnswerDTO answer, Long boardSq) {
		SeedAnswerInsertDTO dto = SeedAnswerInsertDTO.builder()
				.boardSq(boardSq)
				.userSq(answer.getUserSq())
				.answerTtl(answer.getTitle())
				.answerDescriptionEdt(answer.getBodyHtml())
				.answerViewCnt(answer.getViewCnt())
				.answerCommentCnt(answer.getComments().size())
				.answerIsAdoptedYn(answer.isAdopted() ? "Y" : "N")
				.answerCreatedAtDtm(answer.getCreatedAt())
				.build();

		adminSeedMapper.insertSeedAnswer(dto);

		if (dto.getAnswerSq() == null) {
			throw new IllegalStateException("답변 생성키를 받지 못했습니다: " + answer.getTitle());
		}
		return dto.getAnswerSq();
	}

	private SeedCommentInsertDTO toComment(SeedPlanCommentDTO comment, Long boardSq, Long answerSq, Long typeCd) {
		return SeedCommentInsertDTO.builder()
				.userSq(comment.getUserSq())
				.boardSq(boardSq)
				.answerSq(answerSq)
				.commentDescriptionTxt(comment.getDescription())
				.commentTypeCd(typeCd)
				.commentCreatedAtDtm(comment.getCreatedAt())
				.build();
	}

	/**
	 * 댓글을 나눠 넣는다.
	 *
	 * <p>
	 * 빈 리스트는 {@code VALUES} 가 비어 SQL 문법 오류가 나므로 반드시 걸러야 한다
	 * ({@code BoardService.createBoard} 도 같은 이유로 태그 INSERT 앞에 가드를 둔다).
	 * 한 문장이 지나치게 길어지면 {@code max_allowed_packet} 에 걸리므로 청크로 자른다.
	 * </p>
	 */
	private void insertCommentsInChunks(List<SeedCommentInsertDTO> comments) {
		for (int from = 0; from < comments.size(); from += COMMENT_BATCH_SIZE) {
			int to = Math.min(from + COMMENT_BATCH_SIZE, comments.size());
			adminSeedMapper.insertSeedComments(comments.subList(from, to));
		}
	}

	/**
	 * 기준 시각을 정한다.
	 *
	 * <p>
	 * 미리보기가 준 값을 그대로 쓰되 <b>미래는 현재로 잘라낸다</b> — 미래 날짜로 등록된 글은
	 * 목록 상단에 영구히 눌러앉아 정렬을 망가뜨린다.
	 * </p>
	 */
	private LocalDateTime resolveReferenceTime(LocalDateTime plannedAt) {
		LocalDateTime now = LocalDateTime.now();
		return (plannedAt == null || plannedAt.isAfter(now)) ? now : plannedAt;
	}

	/**
	 * 작성자 풀을 확정한다.
	 *
	 * <p>
	 * 지정한 계정이 하나라도 조회되지 않으면 거절한다 — 조용히 빠지면 "왜 이 봇만 글이 없지" 를
	 * 나중에 추적해야 한다.
	 * </p>
	 */
	private List<SeedAuthorDTO> resolveAuthors(List<Long> requestedUserSqs) {
		List<SeedAuthorDTO> authors = adminSeedMapper.findSeedAuthors(requestedUserSqs);

		if (authors.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					requestedUserSqs == null || requestedUserSqs.isEmpty()
							? "시드에 쓸 봇 계정이 없습니다. 봇 계정을 먼저 생성해주세요."
							: "지정한 계정을 찾을 수 없습니다. 개인회원(301)이면서 탈퇴하지 않은 계정만 쓸 수 있습니다.");
		}

		if (requestedUserSqs != null && !requestedUserSqs.isEmpty() && authors.size() != requestedUserSqs.size()) {
			List<Long> found = authors.stream().map(SeedAuthorDTO::getUserSq).toList();
			String missing = requestedUserSqs.stream()
					.filter(sq -> !found.contains(sq))
					.map(String::valueOf)
					.collect(Collectors.joining(", "));
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"찾을 수 없는 계정이 있습니다: " + missing);
		}

		return authors;
	}

	/**
	 * 외부 AI 에 붙여넣을 프롬프트를 만든다.
	 *
	 * <p>
	 * <b>카테고리를 하드코딩하지 않고 공통코드에서 읽는 이유</b> — 카테고리는 DB 에서 켜고 끌 수
	 * 있다(Phase 4 에서 '일반'을 비활성화했다). 프롬프트에 박아두면 AI 가 죽은 코드를 뱉고,
	 * 그 글은 등록 단계에서 전부 거절된다.
	 * </p>
	 *
	 * <p>
	 * <b>본문에 리터럴 {@code %} 를 쓸 때는 반드시 {@code %%} 로 이스케이프할 것.</b>
	 * 이 문자열은 {@link String#formatted} 로 조립되므로 {@code 3.3% 원천징수} 같은 표현이
	 * 서식 지정자로 해석돼 런타임에 터진다(실제로 한 번 겪었다).
	 * </p>
	 */
	@Transactional(readOnly = true)
	public String buildPrompt(int count) {
		List<CommonCodeDTO> categories = commonCodeMapper
				.findActiveChildrenByParent(ParentCodeEnum.BOARD_CATEGORY.getCode());

		String categoryLines = categories.stream()
				.map(c -> String.format("- %d : %s", c.getCommonCodeSq(), c.getCommonCodeNm()))
				.collect(Collectors.joining("\n"));

		return """
				IT 프리랜서(SI·SM 상주 개발자)와 기업을 연결하는 프로젝트 매칭 플랫폼의
				커뮤니티에 올릴 더미 게시글 %d건을 JSON 으로 만들어줘.

				## 출력 형식
				설명이나 인사말 없이 **JSON 배열 하나만** 출력한다. 각 원소의 형태는 다음과 같다.

				[
				  {
				    "type": "BOARD",
				    "categoryHintCd": 3201,
				    "title": "제목 (100자 이내)",
				    "body": "본문 (아래 본문 규칙 참고)",
				    "comments": ["댓글 문구 1", "댓글 문구 2", "댓글 문구 3"],
				    "answers": []
				  },
				  {
				    "type": "QNA",
				    "title": "질문 제목",
				    "body": "질문 본문",
				    "comments": ["댓글 문구 1"],
				    "answers": [
				      { "title": "답변 제목", "body": "답변 본문", "comments": ["댓글 문구"] }
				    ]
				  }
				]

				- type 은 BOARD(일반게시판) 또는 QNA(질문) 둘 중 하나다.
				- categoryHintCd 는 BOARD 일 때만 넣는다. QNA 에는 넣지 않는다.
				- answers 는 QNA 일 때만 채운다. BOARD 는 빈 배열로 둔다.

				## 카테고리 코드 (categoryHintCd 에 쓸 값)
				%s

				## 본문 규칙 — HTML 과 마크다운을 쓰지 않는다
				- 소제목은 줄 맨 앞에 `■ ` 를 붙인다.
				- 목록은 줄 맨 앞에 `- ` 를 붙인다. (하이픈 뒤 공백 필수)
				- 문단은 빈 줄로 나눈다.
				- 표, 이미지, 링크, 코드블록, `**굵게**` 는 쓰지 않는다.

				## 내용 지침
				- 상주 프로젝트를 뛰는 개발자의 말투로 쓴다. 다룰 만한 소재는 이런 것들이다.
				  기술 스택(Java/Spring, React, 레거시 마이그레이션), 장애·야근·배포,
				  단가와 계약(월 단가 협상, 계약 연장, 3.3%% 원천징수, 등급 산정),
				  상주 생활(출퇴근, 재택 여부, 팀 분위기), 이직·전향, 자격증·경력 관리.
				- 제목은 구체적으로 쓴다. "질문 있습니다", "정보 공유합니다" 같은 막연한 제목은 쓰지 않는다.
				- 현장정보 카테고리 글은 다음 소제목 골격을 따른다.
				  ■ 현장명 / ■ 위치 / ■ 공정 · 업무 / ■ 근무 조건 / ■ 참고 사항
				  이 게시판에서 "현장" 은 상주하는 프로젝트를 뜻한다. 현장명에는 고객사·프로젝트명을,
				  공정·업무에는 담당 업무와 기술 스택을, 근무 조건에는 기간·근무 시간·단가를 쓴다.
				- comments 는 글마다 3~5개, 한두 문장짜리 짧은 반응으로 만든다.
				- **제목은 100자, 댓글은 500자를 넘기지 않는다.** (넘으면 등록이 거절된다)
				- QNA 는 answers 를 2~3개 넣되 서로 다른 관점(경험담·공식 문서 인용·대안 제시)으로 쓴다.
				- 실존 회사명, 개인 이름, 연락처, 실제 주소는 넣지 않는다. 고객사는 "A사", "모 금융권" 처럼 익명으로 쓴다.
				- 같은 주제를 반복하지 말고 %d건이 서로 다른 상황을 다루게 한다.

				## 넣지 말아야 할 것
				작성자, 작성일시, 조회수, 추천수, 채택 여부는 **넣지 않는다.** 서버가 알아서 배분한다.
				한 번에 최대 50건까지 등록되므로 50건을 넘기지 않는다.
				""".formatted(count, categoryLines, count);
	}
}
