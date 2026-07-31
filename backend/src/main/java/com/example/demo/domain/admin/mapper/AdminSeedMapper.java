package com.example.demo.domain.admin.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.SeedAnswerInsertDTO;
import com.example.demo.domain.admin.dto.SeedAuthorDTO;
import com.example.demo.domain.admin.dto.SeedBoardInsertDTO;
import com.example.demo.domain.admin.dto.SeedCommentInsertDTO;
import com.example.demo.domain.admin.dto.response.SeedRevokeSampleDTO;

/**
 * 커뮤니티 시드 전용 매퍼.
 *
 * <p>
 * 기존 {@code BoardMapper}/{@code AnswerMapper}/{@code CommentMapper} 를 쓰지 않는 이유는
 * 그쪽 INSERT 가 <b>작성일시·조회수·채택상태를 담지 못하기 때문</b>이다
 * ({@code BoardMapper.xml} 의 insert 는 {@code board_created_at_dtm} 이 아예 없고
 * {@code board_adopt_status_cd} 를 1501 로 하드코딩한다). 시드는 그 값들을 직접 정해야 한다.
 * </p>
 */
@Mapper
public interface AdminSeedMapper {

	/**
	 * 시드 작성자로 쓸 계정을 뽑는다.
	 *
	 * <p>
	 * {@code userSqs} 가 비어 있으면 봇 계정({@code user_id} 가 {@code bot_} 로 시작)을 전부 가져온다.
	 * 관리자 계정이 섞이면 FO 목록에 운영자 명의 더미글이 생기므로 개인회원(301)만 대상이다.
	 * </p>
	 */
	List<SeedAuthorDTO> findSeedAuthors(@Param("userSqs") List<Long> userSqs);

	/**
	 * 주어진 제목 중 <b>이미 등록돼 있는 것</b>만 돌려준다.
	 *
	 * <p>
	 * 매일 시드를 돌리면 외부 AI 가 비슷한 글을 다시 만든다. 회수된 글(논리삭제)은 대상이 아니다 —
	 * 지웠던 주제를 다시 올리는 건 막을 이유가 없다.
	 * </p>
	 */
	List<String> findExistingTitles(@Param("titles") List<String> titles);

	/**
	 * 게시글 한 건. <b>건당 INSERT 다.</b>
	 *
	 * <p>
	 * 답변·댓글이 여기서 생성된 {@code board_sq} 를 참조하기 때문이다. 다중 VALUES 로 묶어 키를
	 * 한꺼번에 되받는 방식은 이론상 되지만, 공용 DB 에서 다른 세션이 끼어들거나
	 * {@code innodb_autoinc_lock_mode} 가 interleaved 면 키 구간이 어긋난다. 그 실패는
	 * <b>답변·댓글이 엉뚱한 글에 붙은 수백 건</b>으로 나타나고 육안으로 찾기 어렵다.
	 * </p>
	 */
	void insertSeedBoard(SeedBoardInsertDTO board);

	/** 답변 한 건. 댓글이 {@code answer_sq} 를 참조하므로 역시 건당 INSERT 다. */
	void insertSeedAnswer(SeedAnswerInsertDTO answer);

	/**
	 * 댓글 배치 INSERT. 댓글은 PK 를 되받을 필요가 없어(대댓글을 만들지 않는다) 유일하게 묶어서 넣는다.
	 * <b>빈 리스트를 넘기면 VALUES 가 비어 SQL 문법 오류가 난다</b> — 호출부가 걸러야 한다.
	 */
	void insertSeedComments(@Param("comments") List<SeedCommentInsertDTO> comments);

	// ── 회수 ──────────────────────────────────────────────────────────────────
	//
	// 아래 메서드는 모두 같은 "대상 게시글 조건" 을 공유한다 (XML 의 revokeBoardPredicate).
	//   · userSqs  — 항상 적용된다. 봇 계정이 쓴 것만 지운다는 보장이 여기서 나온다.
	//   · boardSqs — 주면 정밀 회수(그 글만), 비우면 광역 회수(대상 계정의 모든 글).
	//   · 기간     — 선택.

	int countRevokeBoards(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo);

	int countRevokeAnswers(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo);

	int countRevokeComments(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo,
			@Param("wide") boolean wide);

	List<SeedRevokeSampleDTO> findRevokeSamples(@Param("userSqs") List<Long> userSqs,
			@Param("boardSqs") List<Long> boardSqs, @Param("createdFrom") LocalDateTime createdFrom,
			@Param("createdTo") LocalDateTime createdTo, @Param("limit") int limit);

	/**
	 * 댓글이 지워진 뒤 댓글 수를 다시 세야 하는 <b>살아남는</b> 게시글.
	 *
	 * <p>
	 * 봇이 실제 사용자의 글에 단 댓글이 여기 해당한다. 회수 대상 글은 어차피 안 보이므로 제외한다.
	 * <b>soft delete 하기 전에 불러야 한다</b> — 지운 뒤에는 대상을 찾을 수 없다.
	 * </p>
	 */
	List<Long> findRecalcBoardSqs(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo);

	/** 위와 같은 이유로 답변 쪽도 필요하다. */
	List<Long> findRecalcAnswerSqs(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo);

	/** <b>반드시 댓글 → 답변 → 게시글 순으로 부를 것.</b> 역순이면 상위가 사라진 뒤 하위를 못 찾는다. */
	int softDeleteRevokeComments(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo,
			@Param("wide") boolean wide);

	int softDeleteRevokeAnswers(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo);

	int softDeleteRevokeBoards(@Param("userSqs") List<Long> userSqs, @Param("boardSqs") List<Long> boardSqs,
			@Param("createdFrom") LocalDateTime createdFrom, @Param("createdTo") LocalDateTime createdTo);
}
