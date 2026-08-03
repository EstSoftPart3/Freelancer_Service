package com.example.demo.domain.admin.service.seed;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.admin.constant.SeedPostType;
import com.example.demo.domain.admin.constant.SeedSpreadMode;
import com.example.demo.domain.admin.dto.SeedAuthorDTO;
import com.example.demo.domain.admin.dto.request.SeedAdoptRatioDTO;
import com.example.demo.domain.admin.dto.request.SeedAnswerDTO;
import com.example.demo.domain.admin.dto.request.SeedCommunityRequestDTO;
import com.example.demo.domain.admin.dto.request.SeedOptionsDTO;
import com.example.demo.domain.admin.dto.request.SeedPostDTO;
import com.example.demo.domain.admin.dto.response.SeedAuthorStatDTO;
import com.example.demo.domain.admin.dto.response.SeedCountDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanAnswerDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanCommentDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanResponseDTO;
import com.example.demo.domain.admin.dto.response.SeedPlanRowDTO;
import com.example.demo.domain.admin.dto.response.SeedSummaryDTO;
import com.example.demo.domain.community.constant.BoardAdoptStatusCode;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.CommonCodeDTO;

import lombok.RequiredArgsConstructor;

/**
 * 시드 메타데이터 배분기.
 *
 * <p>
 * 외부 AI 가 만든 <b>콘텐츠</b>(제목·본문·댓글·답변 문구)에 <b>메타데이터</b>(작성자·작성일시·
 * 카테고리·채택상태·조회수)를 붙여 실행 가능한 계획으로 만든다. DB 를 전혀 모르는 순수 로직이라
 * 단위 테스트로 전부 검증할 수 있다.
 * </p>
 *
 * <p>
 * <b>같은 {@code randomSeed} 면 같은 결과가 나와야 한다.</b> 미리보기와 실제 등록이 이 클래스를
 * 각각 부르기 때문에, 재현되지 않으면 화면에서 본 것과 다른 값이 저장된다. 그래서 내부에서
 * {@code Math.random()} 이나 {@code LocalDateTime.now()} 를 직접 부르지 않는다 —
 * 난수는 시드로 만든 {@link Random} 하나만, 현재 시각은 파라미터로 받는다.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class SeedPlanner {

	private final SeedTextToHtmlConverter converter;

	/** 사람이 글을 쓰는 시간대. 새벽 3시에 몰린 목록은 그 자체로 부자연스럽다. */
	private static final int ACTIVE_HOUR_FROM = 8;
	private static final int ACTIVE_HOUR_TO = 24;

	/** 시간대 버킷 경계(일). {@code [0~1, 1~7, 7~30, 30~spreadDays]} */
	private static final int[] WINDOW_BOUNDS = { 0, 1, 7, 30 };

	/**
	 * @param existingTitles 이미 등록돼 있는 제목(정규화된 형태). 여기 걸리는 글은 제외한다.
	 *                       매일 돌리면 외부 AI 가 비슷한 글을 다시 만들기 때문에 필요하다.
	 */
	public SeedPlanResponseDTO plan(SeedCommunityRequestDTO request,
			List<SeedAuthorDTO> authorPool,
			List<CommonCodeDTO> activeCategories,
			LocalDateTime now,
			Set<String> existingTitles) {

		SeedOptionsDTO options = request.getOptions();
		List<SeedPostDTO> posts = request.getPosts();
		Random rnd = new Random(request.getRandomSeed());
		Set<String> warnings = new LinkedHashSet<>();

		if (authorPool == null || authorPool.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"시드에 사용할 작성자 계정이 없습니다. 봇 계정을 먼저 만들어주세요.");
		}

		List<CommonCodeDTO> categories = activeCategories == null ? List.of() : activeCategories;
		boolean hasBoard = posts.stream().anyMatch(p -> p.getType() == SeedPostType.BOARD);
		if (hasBoard && categories.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"활성화된 게시판 카테고리가 없습니다. 공통코드(3200 하위)를 확인해주세요.");
		}

		Map<Long, String> categoryNames = categories.stream().collect(Collectors.toMap(
				CommonCodeDTO::getCommonCodeSq, CommonCodeDTO::getCommonCodeNm, (a, b) -> a, LinkedHashMap::new));

		// 카테고리 순환열. 인덱스로 순환하므로 정확히 1/N 이 되고, 순서만 시드로 섞는다.
		List<Long> categoryCycle = new ArrayList<>(categoryNames.keySet());
		Collections.shuffle(categoryCycle, rnd);

		// 중복 제목을 먼저 걷어낸다. 카테고리 정원과 작성자 순환이 "실제로 등록될 글" 기준으로
		// 계산돼야 하므로 배분보다 앞에 와야 한다.
		List<Integer> liveIndexes = filterDuplicates(posts, existingTitles, warnings);

		AuthorCycle authorCycle = new AuthorCycle(authorPool, rnd);
		Map<Integer, Long> categoryByIndex = assignCategories(posts, liveIndexes, options, categoryCycle, rnd);

		List<SeedPlanRowDTO> rows = new ArrayList<>();

		for (int i : liveIndexes) {
			SeedPostDTO post = posts.get(i);
			boolean isBoard = post.getType() == SeedPostType.BOARD;

			SeedAuthorDTO author = authorCycle.next();
			LocalDateTime createdAt = randomCreatedAt(rnd, options, now);

			String bodyHtml = converter.toHtml(post.getBody());
			if (converter.isHtmlEmpty(bodyHtml)) {
				warnings.add(String.format("%d번째 글 \"%s\" 의 본문이 비어 있습니다.", i + 1, post.getTitle()));
			}

			Long categoryCd = isBoard ? categoryByIndex.get(i) : null;

			List<SeedPlanAnswerDTO> answers = isBoard
					? List.of()
					: buildAnswers(rnd, options, post, author, createdAt, now, authorPool, warnings, i);

			List<SeedPlanCommentDTO> comments = buildComments(rnd, options, post.getComments(),
					author.getUserSq(), createdAt, now, authorPool, warnings);

			rows.add(SeedPlanRowDTO.builder()
					.index(i)
					.type(post.getType())
					.boardTypeCd(isBoard ? BoardTypeCode.NORMAL.getCode() : BoardTypeCode.QNA.getCode())
					.title(post.getTitle().strip())
					.bodyHtml(bodyHtml)
					.userSq(author.getUserSq())
					.userNickname(author.getUserNickname())
					.createdAt(createdAt)
					.viewCnt(randBetween(rnd, options.getViewMin(), options.getViewMax()))
					.categoryCd(categoryCd)
					.categoryNm(categoryCd == null ? null : categoryNames.get(categoryCd))
					.answers(answers)
					.comments(comments)
					.build());
		}

		assignAdoptStatus(rnd, options.getAdoptRatio(), rows, warnings);

		return SeedPlanResponseDTO.builder()
				.randomSeed(request.getRandomSeed())
				.plannedAt(now)
				.summary(buildSummary(rows, categoryNames, authorPool))
				.rows(rows)
				.warnings(new ArrayList<>(warnings))
				.build();
	}

	// ── 중복 제외 ─────────────────────────────────────────────────────────────

	/**
	 * 등록할 글의 요청 인덱스만 남긴다. 이미 있는 제목과 <b>이번 입력 안에서 겹치는 제목</b>을 뺀다.
	 *
	 * <p>
	 * 후자도 필요하다 — 외부 AI 는 한 번에 20건을 만들어도 비슷한 제목을 두 번 뱉는다.
	 * </p>
	 */
	private List<Integer> filterDuplicates(List<SeedPostDTO> posts, Set<String> existingTitles,
			Set<String> warnings) {

		Set<String> known = existingTitles == null ? Set.of() : existingTitles;
		Set<String> seen = new LinkedHashSet<>();
		List<Integer> live = new ArrayList<>();

		for (int i = 0; i < posts.size(); i++) {
			String title = posts.get(i).getTitle().strip();
			String key = normalizeTitle(title);

			if (known.contains(key)) {
				warnings.add(String.format("%d번째 \"%s\" — 이미 등록된 제목이라 제외했습니다.", i + 1, title));
				continue;
			}
			if (!seen.add(key)) {
				warnings.add(String.format("%d번째 \"%s\" — 이번 입력 안에서 제목이 겹쳐 제외했습니다.", i + 1, title));
				continue;
			}
			live.add(i);
		}
		return live;
	}

	/**
	 * 제목 비교용 정규화 — <b>공백을 전부 제거한다.</b>
	 *
	 * <p>
	 * 공백을 하나로 줄이는 것만으로는 부족했다. DB 조회는 결국 문자열 비교라 "단가 협상" 과
	 * "단가  협상" 을 다른 값으로 보고, 그러면 여기서 정규화해봐야 애초에 후보로 올라오지 않는다.
	 * 양쪽(이 메서드와 {@code AdminSeedMapper.findExistingTitles} 의 SQL)이 <b>같은 규칙</b>을
	 * 써야 하고, SQL 에서 표현하기 쉬운 규칙이 "공백 제거" 다.
	 * </p>
	 *
	 * <p>
	 * 부수 효과로 "단가협상" 과 "단가 협상" 도 같은 제목으로 본다 — 중복 판정에서는 그 편이 맞다.
	 * </p>
	 */
	public static String normalizeTitle(String title) {
		return title == null ? "" : title.replaceAll("\\s+", "");
	}

	// ── 카테고리 ──────────────────────────────────────────────────────────────

	/**
	 * 게시글의 카테고리를 한꺼번에 정한다 (요청 인덱스 → 카테고리 코드).
	 *
	 * <p>
	 * <b>균등 배분과 힌트 존중은 충돌한다.</b> 순환열로 기계적으로 돌리면 정확히 1/N 이 되지만,
	 * AI 가 현장정보 양식({@code ■ 현장명 / ■ 위치 …})으로 쓴 본문이 '자유' 로 배정되는 일이 생긴다.
	 * 실제로 첫 검증에서 그렇게 나왔다.
	 * </p>
	 *
	 * <p>
	 * 그래서 <b>카테고리별 목표 개수를 먼저 정하고, 그 한도 안에서 힌트를 최대한 살린다.</b>
	 * 힌트가 없거나 그 카테고리 자리가 다 찬 글만 남은 자리로 흘려보낸다 — 결과는 여전히 정확히
	 * 1/N 이면서 본문과 카테고리가 어긋나는 글이 최소가 된다.
	 * </p>
	 */
	private Map<Integer, Long> assignCategories(List<SeedPostDTO> posts, List<Integer> liveIndexes,
			SeedOptionsDTO options, List<Long> cycle, Random rnd) {

		// 중복으로 제외된 글은 정원 계산에서도 빠져야 한다. 안 그러면 살아남은 글에
		// 배정될 자리가 그만큼 비어 분포가 어긋난다.
		List<Integer> boardIndexes = new ArrayList<>();
		for (int i : liveIndexes) {
			if (posts.get(i).getType() == SeedPostType.BOARD) {
				boardIndexes.add(i);
			}
		}

		Map<Integer, Long> assigned = new LinkedHashMap<>();
		if (boardIndexes.isEmpty()) {
			return assigned;
		}

		Set<Long> activeCodes = new LinkedHashSet<>(cycle);

		if (!options.balanceCategoriesOrDefault()) {
			// 힌트 그대로. 없거나 비활성 코드면 조용히 랜덤으로 떨어뜨린다 —
			// 200건 중 하나 때문에 전체를 실패시킬 이유가 없다.
			for (int index : boardIndexes) {
				Long hint = posts.get(index).getCategoryHintCd();
				assigned.put(index, (hint != null && activeCodes.contains(hint))
						? hint
						: cycle.get(rnd.nextInt(cycle.size())));
			}
			return assigned;
		}

		// 카테고리별 목표 개수.
		int total = boardIndexes.size();
		int base = total / cycle.size();
		int extra = total % cycle.size();

		// 나누어떨어지지 않는 나머지 자리는 "힌트 수요가 많은 카테고리" 부터 준다.
		// 순환열 순서대로 주면, 글 수가 카테고리 수보다 적을 때 힌트를 준 카테고리가
		// 자리를 아예 못 받는 일이 생긴다 (글 2건 / 카테고리 4개면 두 곳만 자리가 있다).
		Map<Long, Integer> demand = new LinkedHashMap<>();
		cycle.forEach(code -> demand.put(code, 0));
		for (int index : boardIndexes) {
			Long hint = posts.get(index).getCategoryHintCd();
			if (hint != null && demand.containsKey(hint)) {
				demand.merge(hint, 1, Integer::sum);
			}
		}

		List<Long> priority = new ArrayList<>(cycle);
		// 수요가 같으면 (이미 섞인) 순환열 순서를 따른다 — 시드가 같으면 결과도 같아야 한다.
		priority.sort(Comparator.comparingInt((Long code) -> demand.get(code)).reversed()
				.thenComparingInt(cycle::indexOf));

		Map<Long, Integer> quota = new LinkedHashMap<>();
		for (int i = 0; i < priority.size(); i++) {
			quota.put(priority.get(i), base + (i < extra ? 1 : 0));
		}

		// 1차 — 자리가 남아 있는 한 힌트를 존중한다.
		List<Integer> unassigned = new ArrayList<>();
		for (int index : boardIndexes) {
			Long hint = posts.get(index).getCategoryHintCd();
			if (hint != null && quota.getOrDefault(hint, 0) > 0) {
				assigned.put(index, hint);
				quota.merge(hint, -1, Integer::sum);
			} else {
				unassigned.add(index);
			}
		}

		// 2차 — 남은 글을 빈 자리에 채운다. 순서에 따른 쏠림이 없도록 섞어서 배정한다.
		Collections.shuffle(unassigned, rnd);
		List<Long> openSlots = new ArrayList<>();
		quota.forEach((code, count) -> {
			for (int i = 0; i < count; i++) {
				openSlots.add(code);
			}
		});
		Collections.shuffle(openSlots, rnd);

		for (int i = 0; i < unassigned.size(); i++) {
			assigned.put(unassigned.get(i), openSlots.get(i));
		}
		return assigned;
	}

	// ── 답변 ──────────────────────────────────────────────────────────────────

	/**
	 * Q&amp;A 답변을 배분한다.
	 *
	 * <p>
	 * 개수는 {@code min(옵션 난수, AI 가 준 답변 수, 쓸 수 있는 작성자 수)} 다.
	 * 없는 답변을 지어낼 수 없고, <b>같은 사람이 한 질문에 두 번 답하지 않게</b> 하기 때문이다.
	 * 원글 작성자도 후보에서 뺀다 — 자문자답이 되면 채택 로직과도 어긋난다.
	 * </p>
	 */
	private List<SeedPlanAnswerDTO> buildAnswers(Random rnd, SeedOptionsDTO options, SeedPostDTO post,
			SeedAuthorDTO postAuthor, LocalDateTime postCreatedAt, LocalDateTime now,
			List<SeedAuthorDTO> pool, Set<String> warnings, int postIndex) {

		List<SeedAnswerDTO> provided = post.getAnswers();
		if (provided == null || provided.isEmpty()) {
			return List.of();
		}

		List<SeedAuthorDTO> candidates = exclude(pool, postAuthor.getUserSq());
		if (candidates.isEmpty()) {
			warnings.add("작성자 계정이 1개뿐이라 답변을 만들 수 없습니다. 봇 계정을 늘려주세요.");
			return List.of();
		}

		int want = randBetween(rnd, options.getAnswerMin(), options.getAnswerMax());
		int count = Math.min(want, Math.min(provided.size(), candidates.size()));
		if (want > candidates.size()) {
			warnings.add(String.format(
					"작성자 계정이 %d개뿐이라 답변 수를 최대 %d개로 줄였습니다. 봇 계정을 늘리면 더 다양해집니다.",
					pool.size(), candidates.size()));
		}
		if (count == 0) {
			return List.of();
		}

		List<SeedAuthorDTO> authors = pickDistinct(rnd, candidates, count);
		List<SeedPlanAnswerDTO> answers = new ArrayList<>();

		for (int i = 0; i < count; i++) {
			SeedAnswerDTO src = provided.get(i);
			SeedAuthorDTO author = authors.get(i);
			LocalDateTime createdAt = randomAfter(rnd, postCreatedAt, now);

			String bodyHtml = converter.toHtml(src.getBody());
			if (converter.isHtmlEmpty(bodyHtml)) {
				warnings.add(String.format("%d번째 글의 답변 \"%s\" 의 본문이 비어 있습니다.",
						postIndex + 1, src.getTitle()));
			}

			// 답변에 달리는 댓글은 원글 작성자(질문자)도 달 수 있다 — 오히려 자연스럽다.
			// 제외 대상은 답변 작성자 본인뿐이다.
			List<SeedPlanCommentDTO> comments = buildComments(rnd, options, src.getComments(),
					author.getUserSq(), createdAt, now, pool, warnings);

			answers.add(SeedPlanAnswerDTO.builder()
					.title(src.getTitle().strip())
					.bodyHtml(bodyHtml)
					.userSq(author.getUserSq())
					.userNickname(author.getUserNickname())
					.createdAt(createdAt)
					.viewCnt(randBetween(rnd, options.getViewMin(), options.getViewMax()))
					.adopted(false)
					.comments(comments)
					.build());
		}

		answers.sort(Comparator.comparing(SeedPlanAnswerDTO::getCreatedAt));
		return answers;
	}

	// ── 댓글 ──────────────────────────────────────────────────────────────────

	/**
	 * 댓글을 배분한다. 작성자는 부모(글 또는 답변) 작성자를 뺀 풀에서 <b>중복 없이</b> 뽑는다.
	 * 그래서 댓글 수는 계정 수 - 1 을 넘을 수 없다.
	 */
	private List<SeedPlanCommentDTO> buildComments(Random rnd, SeedOptionsDTO options, List<String> provided,
			Long parentAuthorSq, LocalDateTime parentCreatedAt, LocalDateTime now,
			List<SeedAuthorDTO> pool, Set<String> warnings) {

		if (provided == null || provided.isEmpty()) {
			return List.of();
		}

		List<String> texts = provided.stream()
				.filter(t -> t != null && !t.isBlank())
				.map(String::strip)
				.toList();
		if (texts.isEmpty()) {
			return List.of();
		}

		List<SeedAuthorDTO> candidates = exclude(pool, parentAuthorSq);
		if (candidates.isEmpty()) {
			warnings.add("작성자 계정이 1개뿐이라 댓글을 만들 수 없습니다. 봇 계정을 늘려주세요.");
			return List.of();
		}

		int want = randBetween(rnd, options.getCommentMin(), options.getCommentMax());
		int count = Math.min(want, Math.min(texts.size(), candidates.size()));
		if (want > candidates.size()) {
			warnings.add(String.format(
					"작성자 계정이 %d개뿐이라 댓글 수를 최대 %d개로 줄였습니다. 봇 계정을 늘리면 더 다양해집니다.",
					pool.size(), candidates.size()));
		}
		if (count == 0) {
			return List.of();
		}

		List<SeedAuthorDTO> authors = pickDistinct(rnd, candidates, count);
		List<SeedPlanCommentDTO> comments = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			SeedAuthorDTO author = authors.get(i);
			comments.add(SeedPlanCommentDTO.builder()
					.userSq(author.getUserSq())
					.userNickname(author.getUserNickname())
					.description(texts.get(i))
					.createdAt(randomAfter(rnd, parentCreatedAt, now))
					.build());
		}

		comments.sort(Comparator.comparing(SeedPlanCommentDTO::getCreatedAt));
		return comments;
	}

	// ── 채택상태 ──────────────────────────────────────────────────────────────

	/**
	 * Q&amp;A 채택상태를 비율대로 배분한다. <b>반드시 답변 개수가 확정된 뒤에 불러야 한다.</b>
	 *
	 * <p>
	 * 지켜야 할 불변식 — 채택완료(1502)는 채택된 답변이 <b>정확히 1건</b>, 나머지 상태는 0건이다.
	 * 답변이 없는 글은 채택완료가 될 수 없다. 이걸 어기면 {@code AnswerService.adoptAnswer} 가
	 * "이미 채택된 답변이 있습니다" 로 영구히 막히는 유령 상태가 생긴다.
	 * </p>
	 */
	private void assignAdoptStatus(Random rnd, SeedAdoptRatioDTO ratio, List<SeedPlanRowDTO> rows,
			Set<String> warnings) {

		List<SeedPlanRowDTO> qna = rows.stream()
				.filter(r -> r.getType() == SeedPostType.QNA)
				.collect(Collectors.toCollection(ArrayList::new));
		if (qna.isEmpty()) {
			return;
		}

		int total = qna.size();
		int adoptedTarget = clamp(Math.round(total * ratio.getAdopted() / 100.0f), 0, total);
		int selfSolvedTarget = clamp(Math.round(total * ratio.getSelfSolved() / 100.0f), 0, total - adoptedTarget);
		int unresolvedTarget = clamp(Math.round(total * ratio.getUnresolved() / 100.0f), 0,
				total - adoptedTarget - selfSolvedTarget);

		Collections.shuffle(qna, rnd);

		// 채택완료를 먼저 배정한다 — 자격(답변 1건 이상)이 있는 글이 한정돼 있기 때문이다.
		List<SeedPlanRowDTO> withAnswers = qna.stream()
				.filter(r -> r.getAnswers() != null && !r.getAnswers().isEmpty())
				.toList();

		int adoptedCount = Math.min(adoptedTarget, withAnswers.size());
		if (adoptedCount < adoptedTarget) {
			warnings.add(String.format(
					"답변이 있는 Q&A 가 %d건뿐이라 채택완료를 %d건만 만들었습니다(요청 %d건). 나머지는 진행중이 됩니다.",
					withAnswers.size(), adoptedCount, adoptedTarget));
		}

		Set<Integer> assigned = new LinkedHashSet<>();
		for (int i = 0; i < adoptedCount; i++) {
			SeedPlanRowDTO row = withAnswers.get(i);
			row.setAdoptStatusCd(BoardAdoptStatusCode.ADOPTED.getCode());
			row.setAdoptStatusNm(BoardAdoptStatusCode.ADOPTED.getLabel());
			// 채택된 답변은 정확히 1건이다.
			List<SeedPlanAnswerDTO> answers = row.getAnswers();
			answers.get(rnd.nextInt(answers.size())).setAdopted(true);
			assigned.add(row.getIndex());
		}

		// 남은 글에 자체해결 → 미해결 → 진행중 순으로 채운다.
		// (채택완료를 못 채운 몫은 자연스럽게 진행중으로 흘러간다)
		List<SeedPlanRowDTO> rest = qna.stream()
				.filter(r -> !assigned.contains(r.getIndex()))
				.toList();

		int cursor = 0;
		cursor = fill(rest, cursor, selfSolvedTarget, BoardAdoptStatusCode.SELF_SOLVED);
		cursor = fill(rest, cursor, unresolvedTarget, BoardAdoptStatusCode.UNRESOLVED);
		fill(rest, cursor, rest.size() - cursor, BoardAdoptStatusCode.IN_PROGRESS);
	}

	private int fill(List<SeedPlanRowDTO> rest, int cursor, int count, BoardAdoptStatusCode status) {
		int end = Math.min(cursor + Math.max(count, 0), rest.size());
		for (int i = cursor; i < end; i++) {
			rest.get(i).setAdoptStatusCd(status.getCode());
			rest.get(i).setAdoptStatusNm(status.getLabel());
		}
		return end;
	}

	// ── 작성일시 ──────────────────────────────────────────────────────────────

	/**
	 * 과거 구간에 작성일시를 흩뿌린다.
	 *
	 * <p>
	 * 단순 균등 분산이 아니라 <b>1일/7일/30일/그이전</b> 네 구간에 가중치를 두고 뽑는다.
	 * 베스트글 위젯({@code findBestBoards})이 그 창으로 글을 고르기 때문에, 전부 먼 과거로
	 * 보내면 시드를 수백 건 넣고도 인기글이 텅 빈다.
	 * </p>
	 */
	private LocalDateTime randomCreatedAt(Random rnd, SeedOptionsDTO options, LocalDateTime now) {
		// 매일 운영 모드 — 오늘 하루 안에서만 고른다. 하루치를 나눠 넣으면
		// "오늘도 사람들이 글을 썼다" 처럼 보이고, 매일 돌리면 날짜가 자연스럽게 쌓인다.
		if (options.spreadModeOrDefault() == SeedSpreadMode.TODAY) {
			return naturalTimeOn(rnd, now.toLocalDate(), now);
		}

		int spread = options.getSpreadDays();
		List<double[]> buckets = buildBuckets(options.getHotWindowRatio(), spread);

		double[] bucket = weightedPick(rnd, buckets);
		double daysAgo = bucket[0] + rnd.nextDouble() * (bucket[1] - bucket[0]);
		LocalDate date = now.toLocalDate().minusDays((long) Math.floor(daysAgo));

		return naturalTimeOn(rnd, date, now);
	}

	/**
	 * 유효한 시간대 버킷을 만든다. {@code spreadDays} 가 짧으면 뒤쪽 버킷이 통째로 사라지므로
	 * 경계를 잘라내고 빈 버킷은 버린다 (그 몫의 가중치도 함께 사라진다).
	 */
	private List<double[]> buildBuckets(List<Integer> ratio, int spread) {
		List<double[]> buckets = new ArrayList<>();
		for (int i = 0; i < WINDOW_BOUNDS.length; i++) {
			double start = WINDOW_BOUNDS[i];
			double end = (i + 1 < WINDOW_BOUNDS.length) ? WINDOW_BOUNDS[i + 1] : spread;
			end = Math.min(end, spread);
			if (end <= start) {
				continue;
			}
			double weight = (ratio != null && ratio.size() == WINDOW_BOUNDS.length && ratio.get(i) != null)
					? ratio.get(i)
					: 1.0;
			if (weight <= 0) {
				continue;
			}
			buckets.add(new double[] { start, end, weight });
		}
		if (buckets.isEmpty()) {
			// 비율을 전부 0으로 준 경우. 옵션을 무시하고 전 구간 균등으로 떨어뜨린다.
			buckets.add(new double[] { 0, Math.max(spread, 1), 1.0 });
		}
		return buckets;
	}

	private double[] weightedPick(Random rnd, List<double[]> buckets) {
		double sum = buckets.stream().mapToDouble(b -> b[2]).sum();
		double pick = rnd.nextDouble() * sum;
		double acc = 0;
		for (double[] bucket : buckets) {
			acc += bucket[2];
			if (pick < acc) {
				return bucket;
			}
		}
		return buckets.get(buckets.size() - 1);
	}

	/** 그 날짜의 활동 시간대(08~24시) 안에서 시각을 고른다. 오늘이면 현재 시각을 넘지 않는다. */
	private LocalDateTime naturalTimeOn(Random rnd, LocalDate date, LocalDateTime now) {
		LocalDateTime from = date.atTime(ACTIVE_HOUR_FROM, 0);
		LocalDateTime to = date.atTime(ACTIVE_HOUR_TO - 1, 59, 59);
		if (to.isAfter(now)) {
			to = now;
		}
		if (!from.isBefore(to)) {
			// 오늘인데 아직 활동 시간대 전(예: 새벽)이다. 현재 시각 직전으로 둔다.
			return now.minusMinutes(rnd.nextInt(60) + 1L);
		}
		return randomBetween(rnd, from, to);
	}

	/**
	 * {@code from} 이후 {@code now} 이전의 시각을 고르되 <b>초반에 몰리게</b> 한다.
	 * 댓글·답변은 글이 올라온 직후에 가장 많이 달린다 — 균등 분산은 오래된 글에 오늘 댓글이
	 * 달린 것처럼 보여 부자연스럽다.
	 */
	private LocalDateTime randomAfter(Random rnd, LocalDateTime from, LocalDateTime now) {
		long seconds = Duration.between(from, now).getSeconds();
		if (seconds <= 1) {
			return now;
		}
		double u = rnd.nextDouble();
		long offset = (long) (seconds * u * u);
		return from.plusSeconds(Math.min(Math.max(offset, 1), seconds));
	}

	private LocalDateTime randomBetween(Random rnd, LocalDateTime from, LocalDateTime to) {
		long seconds = Duration.between(from, to).getSeconds();
		if (seconds <= 0) {
			return from;
		}
		return from.plusSeconds((long) (rnd.nextDouble() * seconds));
	}

	// ── 요약 ──────────────────────────────────────────────────────────────────

	private SeedSummaryDTO buildSummary(List<SeedPlanRowDTO> rows, Map<Long, String> categoryNames,
			List<SeedAuthorDTO> pool) {

		Map<Long, Integer> byCategory = new LinkedHashMap<>();
		categoryNames.keySet().forEach(code -> byCategory.put(code, 0));
		Map<Long, Integer> byStatus = new LinkedHashMap<>();
		for (BoardAdoptStatusCode status : BoardAdoptStatusCode.values()) {
			byStatus.put(status.getCode(), 0);
		}

		Map<Long, int[]> byAuthor = new LinkedHashMap<>();
		pool.forEach(a -> byAuthor.put(a.getUserSq(), new int[3]));

		int boards = 0;
		int qna = 0;
		int answers = 0;
		int comments = 0;
		LocalDateTime min = null;
		LocalDateTime max = null;

		for (SeedPlanRowDTO row : rows) {
			if (row.getType() == SeedPostType.BOARD) {
				boards++;
				byCategory.merge(row.getCategoryCd(), 1, Integer::sum);
			} else {
				qna++;
				byStatus.merge(row.getAdoptStatusCd(), 1, Integer::sum);
			}
			bump(byAuthor, row.getUserSq(), 0);

			min = earliest(min, row.getCreatedAt());
			max = latest(max, row.getCreatedAt());

			for (SeedPlanCommentDTO comment : row.getComments()) {
				comments++;
				bump(byAuthor, comment.getUserSq(), 2);
				max = latest(max, comment.getCreatedAt());
			}
			for (SeedPlanAnswerDTO answer : row.getAnswers()) {
				answers++;
				bump(byAuthor, answer.getUserSq(), 1);
				max = latest(max, answer.getCreatedAt());
				for (SeedPlanCommentDTO comment : answer.getComments()) {
					comments++;
					bump(byAuthor, comment.getUserSq(), 2);
					max = latest(max, comment.getCreatedAt());
				}
			}
		}

		List<SeedCountDTO> categoryCounts = byCategory.entrySet().stream()
				.map(e -> SeedCountDTO.builder()
						.code(e.getKey())
						.name(categoryNames.getOrDefault(e.getKey(), "(알 수 없음)"))
						.count(e.getValue())
						.build())
				.toList();

		List<SeedCountDTO> statusCounts = byStatus.entrySet().stream()
				.map(e -> SeedCountDTO.builder()
						.code(e.getKey())
						.name(BoardAdoptStatusCode.labelOf(e.getKey()))
						.count(e.getValue())
						.build())
				.toList();

		List<SeedAuthorStatDTO> authorStats = pool.stream()
				.map(a -> {
					int[] c = byAuthor.get(a.getUserSq());
					return SeedAuthorStatDTO.builder()
							.userSq(a.getUserSq())
							.userId(a.getUserId())
							.userNickname(a.getUserNickname())
							.boards(c[0])
							.answers(c[1])
							.comments(c[2])
							.total(c[0] + c[1] + c[2])
							.build();
				})
				.sorted(Comparator.comparingInt(SeedAuthorStatDTO::getTotal).reversed())
				.toList();

		return SeedSummaryDTO.builder()
				.totalBoards(boards)
				.totalQna(qna)
				.totalAnswers(answers)
				.totalComments(comments)
				.countByCategory(categoryCounts)
				.countByAdoptStatus(statusCounts)
				.countByAuthor(authorStats)
				.createdAtMin(min)
				.createdAtMax(max)
				.build();
	}

	private void bump(Map<Long, int[]> byAuthor, Long userSq, int slot) {
		byAuthor.computeIfAbsent(userSq, k -> new int[3])[slot]++;
	}

	private LocalDateTime earliest(LocalDateTime current, LocalDateTime candidate) {
		return current == null || candidate.isBefore(current) ? candidate : current;
	}

	private LocalDateTime latest(LocalDateTime current, LocalDateTime candidate) {
		return current == null || candidate.isAfter(current) ? candidate : current;
	}

	// ── 공통 도구 ─────────────────────────────────────────────────────────────

	private List<SeedAuthorDTO> exclude(List<SeedAuthorDTO> pool, Long userSq) {
		return pool.stream().filter(a -> !a.getUserSq().equals(userSq)).toList();
	}

	private List<SeedAuthorDTO> pickDistinct(Random rnd, List<SeedAuthorDTO> candidates, int count) {
		List<SeedAuthorDTO> copy = new ArrayList<>(candidates);
		Collections.shuffle(copy, rnd);
		return copy.subList(0, Math.min(count, copy.size()));
	}

	private int randBetween(Random rnd, int min, int max) {
		if (max <= min) {
			return min;
		}
		return min + rnd.nextInt(max - min + 1);
	}

	private int clamp(int value, int min, int max) {
		return Math.max(min, Math.min(value, max));
	}

	/**
	 * 작성자 순환열 — 라운드로빈 + 지터.
	 *
	 * <p>
	 * 순수 랜덤으로 뽑으면 20건 규모에서도 한 계정이 5번, 다른 계정이 0번 나오는 편중이 눈에 띈다.
	 * 한 바퀴 안에서는 모든 계정이 정확히 한 번씩 나오게 하고, <b>바퀴마다 순서를 다시 섞어</b>
     * 규칙적으로 보이는 것도 막는다.
	 * </p>
	 */
	private static final class AuthorCycle {

		private final List<SeedAuthorDTO> pool;
		private final Random rnd;
		private List<SeedAuthorDTO> current = List.of();
		private int index;

		private AuthorCycle(List<SeedAuthorDTO> pool, Random rnd) {
			this.pool = pool;
			this.rnd = rnd;
		}

		private SeedAuthorDTO next() {
			if (index >= current.size()) {
				List<SeedAuthorDTO> shuffled = new ArrayList<>(pool);
				Collections.shuffle(shuffled, rnd);
				current = shuffled;
				index = 0;
			}
			return current.get(index++);
		}
	}
}
