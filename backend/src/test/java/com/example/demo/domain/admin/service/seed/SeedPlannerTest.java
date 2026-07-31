package com.example.demo.domain.admin.service.seed;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.example.demo.domain.admin.constant.SeedPostType;
import com.example.demo.domain.admin.dto.SeedAuthorDTO;
import com.example.demo.domain.admin.dto.request.SeedAdoptRatioDTO;
import com.example.demo.domain.admin.dto.request.SeedAnswerDTO;
import com.example.demo.domain.admin.dto.request.SeedCommunityRequestDTO;
import com.example.demo.domain.admin.dto.request.SeedOptionsDTO;
import com.example.demo.domain.admin.dto.request.SeedPostDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanAnswerDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanCommentDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanRowDTO;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * 시드 배분기 — DB 에 한 줄도 쓰지 않고 검증할 수 있는 구간이자, 이 기능에서 로직 밀도가
 * 가장 높은 구간이다. 여기서 막지 못한 규칙 위반은 공용 DB 에 수백 행으로 남는다.
 */
class SeedPlannerTest {

	private static final LocalDateTime NOW = LocalDateTime.of(2026, 7, 31, 14, 0);
	private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JavaTimeModule());

	private final SeedPlanner planner = new SeedPlanner(new SeedTextToHtmlConverter());

	// ── 재현성 ────────────────────────────────────────────────────────────────

	@Test
	@DisplayName("같은 시드는 완전히 같은 계획을 만든다 — 이게 깨지면 미리보기가 거짓말이 된다")
	void samePlanForSameSeed() throws Exception {
		List<SeedPostDTO> posts = mixedPosts(20);

		SeedPlanResponseDTO first = plan(7L, defaultOptions(), posts, authors(5));
		SeedPlanResponseDTO second = plan(7L, defaultOptions(), posts, authors(5));

		assertThat(MAPPER.writeValueAsString(first)).isEqualTo(MAPPER.writeValueAsString(second));
	}

	@Test
	@DisplayName("다른 시드는 다른 계획을 만든다")
	void differentPlanForDifferentSeed() throws Exception {
		List<SeedPostDTO> posts = mixedPosts(20);

		SeedPlanResponseDTO first = plan(7L, defaultOptions(), posts, authors(5));
		SeedPlanResponseDTO second = plan(8L, defaultOptions(), posts, authors(5));

		assertThat(MAPPER.writeValueAsString(first)).isNotEqualTo(MAPPER.writeValueAsString(second));
	}

	// ── 채택상태 불변식 ───────────────────────────────────────────────────────

	@Test
	@DisplayName("채택완료는 채택 답변이 정확히 1건, 나머지 상태는 0건이다")
	void adoptStatusInvariantHolds() {
		SeedPlanResponseDTO plan = plan(42L, defaultOptions(), mixedPosts(40), authors(5));

		List<SeedPlanRowDTO> qna = plan.getRows().stream()
				.filter(r -> r.getType() == SeedPostType.QNA)
				.toList();
		assertThat(qna).isNotEmpty();

		for (SeedPlanRowDTO row : qna) {
			long adopted = row.getAnswers().stream().filter(SeedPlanAnswerDTO::isAdopted).count();
			if (row.getAdoptStatusCd() == 1502L) {
				assertThat(adopted)
						.as("채택완료 글 index=%d 은 채택 답변이 정확히 1건이어야 한다", row.getIndex())
						.isEqualTo(1);
			} else {
				assertThat(adopted)
						.as("상태 %d 인 글 index=%d 은 채택 답변이 없어야 한다", row.getAdoptStatusCd(), row.getIndex())
						.isZero();
			}
		}
	}

	@Test
	@DisplayName("모든 Q&A 는 1501~1504 중 하나를 받는다 — 상태 없는 유령 글이 남으면 안 된다")
	void everyQnaGetsStatus() {
		SeedPlanResponseDTO plan = plan(11L, defaultOptions(), mixedPosts(30), authors(5));

		plan.getRows().stream()
				.filter(r -> r.getType() == SeedPostType.QNA)
				.forEach(r -> assertThat(r.getAdoptStatusCd()).isIn(1501L, 1502L, 1503L, 1504L));
	}

	@Test
	@DisplayName("답변이 0개인 Q&A 는 절대 채택완료가 되지 않는다 (요청 비율이 100%여도)")
	void qnaWithoutAnswersIsNeverAdopted() {
		SeedOptionsDTO options = defaultOptions();
		options.setAnswerMin(0);
		options.setAnswerMax(0); // 답변을 하나도 만들지 않는다
		options.setAdoptRatio(ratio(0, 100, 0, 0)); // 그런데 전부 채택완료로 요청한다

		List<SeedPostDTO> posts = IntStream.range(0, 10)
				.mapToObj(i -> qna("질문 " + i, 2, 2))
				.toList();

		SeedPlanResponseDTO plan = plan(3L, options, posts, authors(5));

		assertThat(plan.getRows()).allSatisfy(row -> {
			assertThat(row.getAnswers()).isEmpty();
			assertThat(row.getAdoptStatusCd()).isNotEqualTo(1502L);
		});
		assertThat(plan.getWarnings()).anyMatch(w -> w.contains("채택완료"));
	}

	// ── 시간 정합성 ───────────────────────────────────────────────────────────

	@Test
	@DisplayName("모든 시각은 분산 구간 안에 있고 현재 시각을 넘지 않는다")
	void allTimestampsAreInThePast() {
		SeedOptionsDTO options = defaultOptions();
		options.setSpreadDays(30);

		SeedPlanResponseDTO plan = plan(5L, options, mixedPosts(40), authors(5));

		for (SeedPlanRowDTO row : plan.getRows()) {
			assertThat(row.getCreatedAt()).isBeforeOrEqualTo(NOW);
			assertThat(row.getCreatedAt()).isAfterOrEqualTo(NOW.minusDays(31));
		}
	}

	@Test
	@DisplayName("댓글·답변은 항상 부모보다 뒤에 달린다")
	void repliesAlwaysFollowTheirParent() {
		SeedOptionsDTO options = defaultOptions();
		options.setAnswerMin(1);
		options.setCommentMin(1);

		SeedPlanResponseDTO plan = plan(9L, options, mixedPosts(40), authors(5));

		for (SeedPlanRowDTO row : plan.getRows()) {
			for (SeedPlanCommentDTO comment : row.getComments()) {
				assertThat(comment.getCreatedAt()).isAfterOrEqualTo(row.getCreatedAt());
				assertThat(comment.getCreatedAt()).isBeforeOrEqualTo(NOW);
			}
			for (SeedPlanAnswerDTO answer : row.getAnswers()) {
				assertThat(answer.getCreatedAt()).isAfterOrEqualTo(row.getCreatedAt());
				assertThat(answer.getCreatedAt()).isBeforeOrEqualTo(NOW);
				for (SeedPlanCommentDTO comment : answer.getComments()) {
					assertThat(comment.getCreatedAt()).isAfterOrEqualTo(answer.getCreatedAt());
					assertThat(comment.getCreatedAt()).isBeforeOrEqualTo(NOW);
				}
			}
		}
	}

	// ── 카테고리 ──────────────────────────────────────────────────────────────

	@Test
	@DisplayName("균등 배분이면 카테고리별 건수가 정확히 1/N 이다")
	void balancesCategoriesExactly() {
		List<SeedPostDTO> posts = IntStream.range(0, 12).mapToObj(i -> board("글 " + i, 0)).toList();

		SeedPlanResponseDTO plan = plan(1L, defaultOptions(), posts, authors(5));

		assertThat(plan.getSummary().getCountByCategory())
				.allSatisfy(c -> assertThat(c.getCount()).isEqualTo(3));
	}

	@Test
	@DisplayName("균등 배분이어도 자리가 있으면 힌트를 존중한다 — 현장정보 양식 글이 '자유'로 가면 안 된다")
	void respectsHintsWithinQuota() {
		List<SeedPostDTO> posts = new ArrayList<>();
		for (int i = 0; i < 12; i++) {
			SeedPostDTO post = board("글 " + i, 0);
			if (i < 3) {
				post.setCategoryHintCd(3203L); // 정원(12/4=3) 과 같은 수만 힌트를 준다
			}
			posts.add(post);
		}

		SeedPlanResponseDTO plan = plan(1L, defaultOptions(), posts, authors(5));

		// 힌트를 준 3건은 전부 현장정보로 간다
		assertThat(plan.getRows().subList(0, 3))
				.allSatisfy(row -> assertThat(row.getCategoryCd()).isEqualTo(3203L));
		// 그러면서도 분포는 여전히 정확히 1/N 이다
		assertThat(plan.getSummary().getCountByCategory())
				.allSatisfy(c -> assertThat(c.getCount()).isEqualTo(3));
	}

	@Test
	@DisplayName("글 수가 카테고리 수보다 적어도 힌트를 준 카테고리가 자리를 받는다")
	void respectsHintsWhenFewerPostsThanCategories() {
		SeedPostDTO fieldInfo = board("현장 정보 글", 0);
		fieldInfo.setCategoryHintCd(3203L);
		SeedPostDTO free = board("자유 글", 0);
		free.setCategoryHintCd(3201L);

		// 글 2건 / 카테고리 4개 — 정원이 2곳에만 생긴다. 그 2곳이 힌트를 준 곳이어야 한다.
		SeedPlanResponseDTO plan = plan(1L, defaultOptions(), List.of(fieldInfo, free), authors(5));

		assertThat(plan.getRows().get(0).getCategoryCd()).isEqualTo(3203L);
		assertThat(plan.getRows().get(1).getCategoryCd()).isEqualTo(3201L);
	}

	@Test
	@DisplayName("힌트가 정원을 넘치면 넘친 만큼만 다른 카테고리로 흘려보낸다")
	void overflowingHintsSpillOver() {
		List<SeedPostDTO> posts = new ArrayList<>();
		for (int i = 0; i < 12; i++) {
			SeedPostDTO post = board("글 " + i, 0);
			post.setCategoryHintCd(3203L); // 12건 전부 같은 카테고리를 원한다
			posts.add(post);
		}

		SeedPlanResponseDTO plan = plan(1L, defaultOptions(), posts, authors(5));

		assertThat(plan.getSummary().getCountByCategory())
				.allSatisfy(c -> assertThat(c.getCount()).isEqualTo(3));
	}

	@Test
	@DisplayName("균등 배분을 끄면 AI 가 준 카테고리 힌트를 그대로 쓴다")
	void honoursCategoryHintWhenBalancingIsOff() {
		SeedOptionsDTO options = defaultOptions();
		options.setBalanceCategories(false);

		SeedPostDTO post = board("현장 정보", 0);
		post.setCategoryHintCd(3203L);

		SeedPlanResponseDTO plan = plan(1L, options, List.of(post), authors(5));

		assertThat(plan.getRows().get(0).getCategoryCd()).isEqualTo(3203L);
		assertThat(plan.getRows().get(0).getCategoryNm()).isEqualTo("현장정보");
	}

	@Test
	@DisplayName("Q&A 에는 카테고리를 붙이지 않는다 — BoardService.resolveCategoryCd 와 같은 규칙")
	void qnaHasNoCategory() {
		SeedPlanResponseDTO plan = plan(1L, defaultOptions(), List.of(qna("질문", 1, 1)), authors(5));

		assertThat(plan.getRows().get(0).getCategoryCd()).isNull();
	}

	// ── 작성자 배분 규칙 ──────────────────────────────────────────────────────

	@Test
	@DisplayName("자기 글에 자기가 댓글·답변을 달지 않고, 한 글 안에서 댓글 작성자가 겹치지 않는다")
	void authorRulesHold() {
		SeedOptionsDTO options = defaultOptions();
		options.setAnswerMin(1);
		options.setCommentMin(2);
		options.setCommentMax(3);

		SeedPlanResponseDTO plan = plan(13L, options, mixedPosts(40), authors(5));

		for (SeedPlanRowDTO row : plan.getRows()) {
			List<Long> commenters = row.getComments().stream().map(SeedPlanCommentDTO::getUserSq).toList();
			assertThat(commenters).doesNotContain(row.getUserSq());
			assertThat(commenters).doesNotHaveDuplicates();

			List<Long> answerers = row.getAnswers().stream().map(SeedPlanAnswerDTO::getUserSq).toList();
			assertThat(answerers).doesNotContain(row.getUserSq());
			assertThat(answerers).doesNotHaveDuplicates();

			for (SeedPlanAnswerDTO answer : row.getAnswers()) {
				List<Long> replyAuthors = answer.getComments().stream()
						.map(SeedPlanCommentDTO::getUserSq).toList();
				assertThat(replyAuthors).doesNotContain(answer.getUserSq());
				assertThat(replyAuthors).doesNotHaveDuplicates();
			}
		}
	}

	@Test
	@DisplayName("게시글 작성자는 라운드로빈이라 계정별로 고르게 나눠진다 — 순수 랜덤은 편중이 눈에 띈다")
	void distributesPostAuthorsEvenly() {
		List<SeedPostDTO> posts = IntStream.range(0, 20).mapToObj(i -> board("글 " + i, 0)).toList();

		SeedPlanResponseDTO plan = plan(21L, defaultOptions(), posts, authors(5));

		assertThat(plan.getSummary().getCountByAuthor())
				.allSatisfy(stat -> assertThat(stat.getBoards()).isEqualTo(4));
	}

	@Test
	@DisplayName("계정이 부족하면 댓글 수를 줄이고 경고를 남긴다 — 조용히 깎으면 원인을 못 찾는다")
	void warnsWhenAuthorPoolIsTooSmall() {
		SeedOptionsDTO options = defaultOptions();
		options.setCommentMin(5);
		options.setCommentMax(5);

		SeedPlanResponseDTO plan = plan(1L, options, List.of(board("글", 5)), authors(3));

		// 작성자 3명 - 원글 작성자 1명 = 최대 2건
		assertThat(plan.getRows().get(0).getComments()).hasSize(2);
		assertThat(plan.getWarnings()).anyMatch(w -> w.contains("봇 계정을 늘리면"));
	}

	@Test
	@DisplayName("본문이 비면 경고로 올린다 — 제목만 있는 글이 조용히 등록되면 안 된다")
	void warnsOnEmptyBody() {
		SeedPostDTO post = board("제목만 있는 글", 0);
		post.setBody("   ");

		SeedPlanResponseDTO plan = plan(1L, defaultOptions(), List.of(post), authors(5));

		assertThat(plan.getWarnings()).anyMatch(w -> w.contains("본문이 비어"));
	}

	// ── 요약 ──────────────────────────────────────────────────────────────────

	@Test
	@DisplayName("요약의 합계가 실제 계획과 일치한다")
	void summaryMatchesRows() {
		SeedOptionsDTO options = defaultOptions();
		options.setAnswerMin(1);
		options.setCommentMin(1);

		SeedPlanResponseDTO plan = plan(77L, options, mixedPosts(30), authors(5));

		long boards = plan.getRows().stream().filter(r -> r.getType() == SeedPostType.BOARD).count();
		long qna = plan.getRows().stream().filter(r -> r.getType() == SeedPostType.QNA).count();
		long answers = plan.getRows().stream().mapToLong(r -> r.getAnswers().size()).sum();
		long comments = plan.getRows().stream()
				.mapToLong(r -> r.getComments().size()
						+ r.getAnswers().stream().mapToLong(a -> a.getComments().size()).sum())
				.sum();

		assertThat(plan.getSummary().getTotalBoards()).isEqualTo((int) boards);
		assertThat(plan.getSummary().getTotalQna()).isEqualTo((int) qna);
		assertThat(plan.getSummary().getTotalAnswers()).isEqualTo((int) answers);
		assertThat(plan.getSummary().getTotalComments()).isEqualTo((int) comments);
	}

	// ── 픽스처 ────────────────────────────────────────────────────────────────

	private SeedPlanResponseDTO plan(long seed, SeedOptionsDTO options, List<SeedPostDTO> posts,
			List<SeedAuthorDTO> authors) {
		SeedCommunityRequestDTO request = new SeedCommunityRequestDTO();
		request.setRandomSeed(seed);
		request.setOptions(options);
		request.setPosts(posts);
		return planner.plan(request, authors, categories(), NOW);
	}

	private SeedOptionsDTO defaultOptions() {
		SeedOptionsDTO options = new SeedOptionsDTO();
		options.setSpreadDays(60);
		options.setCommentMin(0);
		options.setCommentMax(3);
		options.setAnswerMin(0);
		options.setAnswerMax(2);
		options.setViewMin(0);
		options.setViewMax(500);
		options.setAdoptRatio(ratio(40, 30, 15, 15));
		return options;
	}

	private SeedAdoptRatioDTO ratio(int inProgress, int adopted, int selfSolved, int unresolved) {
		SeedAdoptRatioDTO r = new SeedAdoptRatioDTO();
		r.setInProgress(inProgress);
		r.setAdopted(adopted);
		r.setSelfSolved(selfSolved);
		r.setUnresolved(unresolved);
		return r;
	}

	/** 게시글과 Q&A 를 번갈아 만든다. */
	private List<SeedPostDTO> mixedPosts(int count) {
		List<SeedPostDTO> posts = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			posts.add(i % 2 == 0 ? board("게시글 " + i, 3) : qna("질문 " + i, 2, 3));
		}
		return posts;
	}

	private SeedPostDTO board(String title, int commentCount) {
		SeedPostDTO post = new SeedPostDTO();
		post.setType(SeedPostType.BOARD);
		post.setTitle(title);
		post.setBody("■ 개요\n" + title + " 의 본문입니다.\n- 항목 A\n- 항목 B");
		post.setComments(texts("댓글", commentCount));
		return post;
	}

	private SeedPostDTO qna(String title, int answerCount, int commentCount) {
		SeedPostDTO post = new SeedPostDTO();
		post.setType(SeedPostType.QNA);
		post.setTitle(title);
		post.setBody(title + " 에 대해 궁금합니다.");
		post.setComments(texts("댓글", commentCount));

		List<SeedAnswerDTO> answers = new ArrayList<>();
		for (int i = 0; i < answerCount; i++) {
			SeedAnswerDTO answer = new SeedAnswerDTO();
			answer.setTitle("답변 " + i);
			answer.setBody("이렇게 하시면 됩니다 " + i);
			answer.setComments(texts("답변댓글", commentCount));
			answers.add(answer);
		}
		post.setAnswers(answers);
		return post;
	}

	private List<String> texts(String prefix, int count) {
		return IntStream.range(0, count).mapToObj(i -> prefix + " " + i).toList();
	}

	private List<SeedAuthorDTO> authors(int count) {
		return IntStream.rangeClosed(1, count)
				.mapToObj(i -> SeedAuthorDTO.builder()
						.userSq(100L + i)
						.userId(String.format("bot_%02d", i))
						.userNickname("봇" + i)
						.build())
				.toList();
	}

	private List<CommonCodeDTO> categories() {
		return List.of(
				category(3201L, "자유"),
				category(3203L, "현장정보"),
				category(3204L, "기능요청"),
				category(3205L, "정보"));
	}

	private CommonCodeDTO category(Long code, String name) {
		CommonCodeDTO dto = new CommonCodeDTO();
		dto.setCommonCodeSq(code);
		dto.setCommonCodeNm(name);
		dto.setParentCommonCodeSq(3200L);
		return dto;
	}
}
