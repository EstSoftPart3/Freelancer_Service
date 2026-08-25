package com.example.demo.domain.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.admin.dto.ApplySeedAreaDTO;
import com.example.demo.domain.admin.dto.ApplySeedBotDTO;
import com.example.demo.domain.admin.dto.ApplySeedInsertDTO;
import com.example.demo.domain.admin.dto.ApplySeedPairDTO;
import com.example.demo.domain.admin.dto.ApplySeedProjectDTO;
import com.example.demo.domain.admin.dto.request.ApplySeedRequestDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedCommitResponseDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedPlanResponseDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedRevokeResponseDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedStatusResponseDTO;
import com.example.demo.domain.admin.mapper.AdminApplySeedMapper;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.service.ResumeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 봇 지원 시드 (운영 도구).
 *
 * <p>
 * 공고가 올라온 뒤 BO 에서 눌러 쓴다. 실제 지원자가 붙기 전까지 프로젝트 목록이
 * "지원 0건" 으로만 보이는 것을 메우는 게 목적이다.
 * </p>
 *
 * <p>
 * <b>서버가 막아주지 않는다는 것을 전제로 짰다.</b> {@code ProjectService.createProjectApplication}
 * 의 검증은 "탈퇴 회원 차단" 하나뿐이라 중복 지원도, 마감 공고 지원도, 남의 이력서로 지원도 통과한다.
 * FO 가 버튼을 숨겨서 안 일어날 뿐이다. 그래서 절제는 전부 이 클래스가 한다 —
 * 채용중 공고만 고르고, 한 공고에 같은 사람을 두 번 넣지 않는다.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminApplySeedService {

	private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

	/** 티어별 기본 지원 건수 범위. 요청에서 덮어쓸 수 있다. */
	private static final int HOT_MIN = 15, HOT_MAX = 30;
	private static final int NORMAL_MIN = 4, NORMAL_MAX = 12;
	private static final int COLD_MIN = 0, COLD_MAX = 3;

	/** 조회수 내림차순 기준 상위 20% 는 HOT, 다음 50% 는 NORMAL, 나머지는 COLD. */
	private static final double HOT_RATIO = 0.2;
	private static final double NORMAL_RATIO = 0.7;

	/** 지원 시각을 넣을 시간대. 새벽 4시에 몰린 지원 목록은 그 자체로 부자연스럽다. */
	private static final int HOUR_FROM = 8, HOUR_TO = 23;

	private final AdminApplySeedMapper mapper;
	private final CommonCodeMapper commonCodeMapper;
	private final ResumeService resumeService;

	// ── 조회 ────────────────────────────────────────────────────────────

	/** 채용중 공고 목록. 화면 첫 진입에서 쓴다. */
	public List<ApplySeedProjectDTO> findRecruitingProjects() {
		return mapper.findRecruitingProjects(null);
	}

	/** 봇 현황 — 몇 개가 있고 그중 몇이 이력서를 가졌는지. */
	public ApplySeedStatusResponseDTO status() {
		List<ApplySeedBotDTO> bots = mapper.findBots();
		int withResume = (int) bots.stream().filter(b -> b.getResumeSq() != null).count();
		return ApplySeedStatusResponseDTO.builder()
				.totalBots(bots.size())
				.botsWithResume(withResume)
				.botsWithoutResume(bots.size() - withResume)
				.bots(bots)
				.build();
	}

	// ── 이력서 채우기 ────────────────────────────────────────────────────

	/**
	 * 이력서가 없는 봇에게 하나씩 만들어 준다. <b>멱등하다</b> — 두 번 눌러도 이미 있는 봇은 건너뛴다.
	 *
	 * <p>
	 * {@code TBL_PROJECT_APPLICATION_H.resume_sq} 가 NOT NULL 이고 지원자 조회가
	 * {@code JOIN TBL_RESUME_M}(INNER)이라, 이력서 없는 봇은 지원 자체가 불가능하다.
	 * </p>
	 *
	 * <p>
	 * {@code ResumeService.createResume} 를 그대로 호출한다 — 봇마다 로그인해 multipart 요청을
	 * 보내는 대신 서비스를 직접 부르면 같은 경로를 타면서 파일 업로드만 건너뛴다.
	 * </p>
	 */
	@Transactional
	public int ensureResumes() {
		List<ApplySeedBotDTO> bots = mapper.findBots();
		List<ApplySeedAreaDTO> areas = mapper.findAreaCodes();
		if (areas.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"지역코드(TBL_AREA_C)가 비어 있어 이력서 주소를 만들 수 없다.");
		}

		int created = 0;
		for (ApplySeedBotDTO bot : bots) {
			if (bot.getResumeSq() != null) {
				continue;
			}
			// 봇마다 같은 값이 나오도록 user_sq 를 시드로 쓴다. 다시 돌려도 같은 사람이 된다.
			Random rnd = new Random(bot.getUserSq());
			ApplySeedAreaDTO area = areas.get(rnd.nextInt(areas.size()));

			ResumeRequestDTO dto = new ResumeRequestDTO();
			ResumeRequestDTO.AddressDTO addr = new ResumeRequestDTO.AddressDTO();
			addr.setZonecode("00000");
			addr.setAddress(area.getSigungu());
			addr.setDetailAddress("");
			addr.setSigungu(area.getSigungu());
			// 좌표는 NOT NULL 이라 값이 있어야 한다. 지도에 찍힐 일이 없는 이력서 주소라 0 으로 둔다.
			addr.setLatitude(0d);
			addr.setLongitude(0d);
			addr.setAreaCodeSq(area.getAreaCodeSq());
			dto.setAddress(addr);

			String name = koreanName(rnd);
			dto.setResumeTtl(name + " 이력서");
			dto.setResumeNm(name);
			dto.setResumeBirthDt(LocalDate.of(1985 + rnd.nextInt(18), 1 + rnd.nextInt(12), 1 + rnd.nextInt(28)));
			dto.setResumePhoneNum("010" + String.format("%08d", 10000000 + rnd.nextInt(80000000)));
			dto.setResumeEmail(bot.getUserId() + "@estsw.local");
			dto.setResumeGreetingTxt("");
			dto.setResumeIsNotificationYn("N");
			// 대표로 둬야 findBots 의 대표 우선 조회에 걸린다.
			dto.setResumeIsRepresentativeYn("Y");

			resumeService.createResume(bot.getUserSq(), dto, null, null);
			created++;
		}
		log.info("[apply-seed] 봇 이력서 생성 {}건 (전체 봇 {}개)", created, bots.size());
		return created;
	}

	/** 지원자 목록에 뜨는 이름이라 '봇계정01' 대신 사람 이름처럼 보이게 만든다. */
	private String koreanName(Random rnd) {
		final String[] sur = { "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
				"한", "오", "서", "신", "권", "황", "안", "송", "류", "전" };
		final String[] mid = { "지", "서", "예", "민", "민", "수", "하", "재", "성", "우",
				"준", "다", "은", "시", "유", "도", "가", "주", "현", "태" };
		final String[] last = { "우", "연", "준", "훈", "영", "빈", "아", "진", "호", "석",
				"희", "원", "현", "람", "결", "찬", "율", "온", "슬", "한" };
		return sur[rnd.nextInt(sur.length)] + mid[rnd.nextInt(mid.length)] + last[rnd.nextInt(last.length)];
	}

	// ── 배분 ────────────────────────────────────────────────────────────

	/** 배분 미리보기. <b>DB 에 아무것도 쓰지 않는다.</b> */
	public ApplySeedPlanResponseDTO plan(ApplySeedRequestDTO req) {
		LocalDateTime baseAt = (req.getPlannedAt() == null || req.getPlannedAt().isBlank())
				? LocalDateTime.now()
				: LocalDateTime.parse(req.getPlannedAt(), TS);
		return buildPlan(req, baseAt);
	}

	private ApplySeedPlanResponseDTO buildPlan(ApplySeedRequestDTO req, LocalDateTime baseAt) {
		List<ApplySeedProjectDTO> projects = mapper.findRecruitingProjects(req.getProjectSqs());
		List<ApplySeedBotDTO> allBots = mapper.findBots();
		List<ApplySeedBotDTO> usable = allBots.stream().filter(b -> b.getResumeSq() != null).toList();

		List<String> warnings = new ArrayList<>();
		int noResume = allBots.size() - usable.size();
		if (noResume > 0) {
			warnings.add(String.format(
					"봇 %d개가 이력서가 없어 배분에서 빠졌다. 등록을 실행하면 자동으로 만들어진다.", noResume));
		}
		if (projects.isEmpty()) {
			warnings.add("채용중인 공고가 없다. 모집기간이 오늘을 포함해야 대상이 된다.");
		}
		if (usable.isEmpty() && noResume == 0) {
			warnings.add("봇 계정이 없다. phase9-bot-accounts.py 로 먼저 만들 것.");
		}

		// 이미 붙어 있는 지원 — 봇이든 실사용자든 같은 사람을 또 넣지 않는다.
		Set<String> taken = new HashSet<>();
		if (!projects.isEmpty()) {
			List<Long> sqs = projects.stream().map(ApplySeedProjectDTO::getProjectSq).toList();
			for (ApplySeedPairDTO p : mapper.findExistingApplications(sqs)) {
				taken.add(p.getProjectSq() + ":" + p.getUserSq());
			}
		}

		// 이력서가 아직 없는 봇도 배분에는 넣는다 — 등록 시점에 ensureResumes 가 먼저 돌아
		// 전부 이력서를 갖게 되기 때문이다. 그래야 미리보기 건수와 실제 등록 건수가 일치한다.
		List<ApplySeedBotDTO> pickable = allBots;

		Random rnd = new Random(req.getRandomSeed());
		int hotEnd = (int) Math.ceil(projects.size() * HOT_RATIO);
		int normalEnd = (int) Math.ceil(projects.size() * NORMAL_RATIO);

		List<ApplySeedPlanResponseDTO.Allocation> allocations = new ArrayList<>();
		int total = 0;

		for (int i = 0; i < projects.size(); i++) {
			ApplySeedProjectDTO p = projects.get(i);
			String tier = i < hotEnd ? "HOT" : (i < normalEnd ? "NORMAL" : "COLD");
			int want = switch (tier) {
				case "HOT" -> between(rnd, req.hotMinOr(HOT_MIN), req.hotMaxOr(HOT_MAX));
				case "NORMAL" -> between(rnd, req.normalMinOr(NORMAL_MIN), req.normalMaxOr(NORMAL_MAX));
				default -> between(rnd, req.coldMinOr(COLD_MIN), req.coldMaxOr(COLD_MAX));
			};

			// 공고마다 봇 순서를 새로 섞는다. 안 섞으면 user_sq 가 작은 봇만 모든 공고에 등장한다.
			List<ApplySeedBotDTO> pool = new ArrayList<>(pickable);
			Collections.shuffle(pool, rnd);

			List<Long> picked = new ArrayList<>();
			for (ApplySeedBotDTO b : pool) {
				if (picked.size() >= want) {
					break;
				}
				if (taken.contains(p.getProjectSq() + ":" + b.getUserSq())) {
					continue;
				}
				picked.add(b.getUserSq());
			}

			allocations.add(ApplySeedPlanResponseDTO.Allocation.builder()
					.projectSq(p.getProjectSq())
					.projectTtl(p.getProjectTtl())
					.companyNm(p.getCompanyNm())
					.tier(tier)
					.currentCnt(p.getCandidateCnt())
					.plannedCnt(picked.size())
					.botUserSqs(picked)
					.build());
			total += picked.size();
		}

		return ApplySeedPlanResponseDTO.builder()
				.randomSeed(req.getRandomSeed())
				.plannedAt(baseAt.format(TS))
				.summary(ApplySeedPlanResponseDTO.Summary.builder()
						.targetProjects(projects.size())
						.totalApplications(total)
						.usableBots(usable.size())
						.botsWithoutResume(noResume)
						.build())
				.allocations(allocations)
				.warnings(warnings)
				.build();
	}

	private int between(Random rnd, int min, int max) {
		int lo = Math.min(min, max);
		int hi = Math.max(min, max);
		return lo + rnd.nextInt(hi - lo + 1);
	}

	// ── 실행 ────────────────────────────────────────────────────────────

	/**
	 * 실제 지원 등록.
	 *
	 * <p>
	 * {@code plannedAt} 을 요구하는 이유 — 없으면 서버가 기준 시각을 "지금" 으로 다시 잡아
	 * 지원일시 분산이 미리보기와 달라진다. 미리보기에서 본 것과 다른 게 저장되면 도구를 믿을 수 없다.
	 * </p>
	 */
	@Transactional
	public ApplySeedCommitResponseDTO commit(ApplySeedRequestDTO req) {
		if (req.getPlannedAt() == null || req.getPlannedAt().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"plannedAt 이 없다. 미리보기 응답의 값을 그대로 실어 보낼 것.");
		}

		// 배분이 봇 전체를 대상으로 하므로 이력서를 먼저 채운다. 순서가 바뀌면
		// 이력서 없는 봇이 통째로 건너뛰어져 미리보기보다 적게 등록된다.
		int createdResumes = ensureResumes();

		LocalDateTime baseAt = LocalDateTime.parse(req.getPlannedAt(), TS);
		ApplySeedPlanResponseDTO plan = buildPlan(req, baseAt);

		Long statusCd = requireCode("APPLIED", 800L, "지원 상태(801 지원중)");
		Long memberTypeCd = requireCode("PERSONAL", 300L, "회원 구분(301 개인)");

		// user_sq -> resume_sq. 봇마다 매번 조회하면 100개 공고에서 수천 번 돈다.
		Map<Long, Long> resumeByUser = new HashMap<>();
		for (ApplySeedBotDTO b : mapper.findBots()) {
			if (b.getResumeSq() != null) {
				resumeByUser.put(b.getUserSq(), b.getResumeSq());
			}
		}

		// 공고별 모집 시작일 — 지원일시를 그 뒤로 두기 위해 필요하다.
		Map<Long, LocalDate> startByProject = new HashMap<>();
		for (ApplySeedProjectDTO p : mapper.findRecruitingProjects(req.getProjectSqs())) {
			startByProject.put(p.getProjectSq(), p.getRecruitStartDt());
		}

		// 배분과 다른 시드를 쓴다. 같은 시드를 재사용하면 봇 선택 순서와 시각 분포가
		// 같은 난수열을 공유해 특정 봇이 항상 이른 시각에 몰린다.
		Random rnd = new Random(req.getRandomSeed() * 31 + 7);
		int inserted = 0;

		for (ApplySeedPlanResponseDTO.Allocation alloc : plan.getAllocations()) {
			if (alloc.getPlannedCnt() == 0) {
				continue;
			}
			LocalDate from = startByProject.get(alloc.getProjectSq());
			int added = 0;

			for (Long userSq : alloc.getBotUserSqs()) {
				Long resumeSq = resumeByUser.get(userSq);
				if (resumeSq == null) {
					continue; // 이력서 생성이 실패한 봇. 카운터에도 반영하지 않는다.
				}
				mapper.insertApplication(ApplySeedInsertDTO.builder()
						.projectSq(alloc.getProjectSq())
						.resumeSq(resumeSq)
						.statusCd(statusCd)
						.memberTypeCd(memberTypeCd)
						.createdAtDtm(randomApplyTime(rnd, from, baseAt))
						.build());
				added++;
			}
			inserted += added;
			// 카운터는 건당이 아니라 공고당 한 번에 반영한다. 실제로 들어간 건수만 더한다.
			if (added > 0) {
				mapper.addCandidateCnt(alloc.getProjectSq(), added);
			}
		}

		log.info("[apply-seed] 등록 seed={} 공고={} 지원={} 이력서신규={}",
				req.getRandomSeed(), plan.getAllocations().size(), inserted, createdResumes);

		return ApplySeedCommitResponseDTO.builder()
				.randomSeed(req.getRandomSeed())
				.targetProjects(plan.getSummary().getTargetProjects())
				.insertedApplications(inserted)
				.createdResumes(createdResumes)
				.build();
	}

	/**
	 * 모집 시작일 ~ 기준시각 사이의 임의 시각. 시간대는 08~23시로 제한한다.
	 *
	 * <p>
	 * 미래로 넘어가지 않게 자른다 — 지원일시가 지금보다 뒤면 기업 화면의 정렬이 뒤집힌다.
	 * </p>
	 */
	private LocalDateTime randomApplyTime(Random rnd, LocalDate from, LocalDateTime baseAt) {
		LocalDate today = baseAt.toLocalDate();
		LocalDate start = (from == null || from.isAfter(today)) ? today.minusDays(14) : from;
		if (start.isAfter(today)) {
			start = today;
		}
		long span = today.toEpochDay() - start.toEpochDay();
		LocalDate day = span <= 0 ? start : start.plusDays(rnd.nextInt((int) span + 1));

		int hour = HOUR_FROM + rnd.nextInt(HOUR_TO - HOUR_FROM + 1);
		LocalDateTime at = day.atTime(hour, rnd.nextInt(60), rnd.nextInt(60));
		return at.isAfter(baseAt) ? baseAt.minusMinutes(rnd.nextInt(180) + 1) : at;
	}

	private Long requireCode(String engName, Long parent, String label) {
		Long cd = commonCodeMapper.findCommonCodeSqByEngName(engName, parent);
		if (cd == null) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					label + " 공통코드를 찾지 못했다. TBL_COMMON_CODE_C 가 비어 있는지 확인할 것.");
		}
		return cd;
	}

	// ── 회수 ────────────────────────────────────────────────────────────

	/** 회수 대상 집계. 아무것도 지우지 않는다. */
	public ApplySeedRevokeResponseDTO revokePreview(List<Long> projectSqs) {
		List<ApplySeedRevokeResponseDTO.Sample> counts = mapper.findBotApplicationCounts(projectSqs);
		return ApplySeedRevokeResponseDTO.builder()
				.applications(counts.stream().mapToInt(ApplySeedRevokeResponseDTO.Sample::getCount).sum())
				.affectedProjects(counts.size())
				.samples(counts)
				.build();
	}

	/**
	 * 회수 실행 — 봇 지원을 물리 삭제하고 카운터를 되돌린다.
	 *
	 * <p>
	 * 삭제 전에 공고별 건수를 먼저 읽는다. 지우고 나서는 몇 건이었는지 알 수 없어
	 * {@code project_candidate_cnt} 를 정확히 되돌릴 방법이 없다.
	 * </p>
	 */
	@Transactional
	public ApplySeedRevokeResponseDTO revoke(List<Long> projectSqs) {
		List<ApplySeedRevokeResponseDTO.Sample> counts = mapper.findBotApplicationCounts(projectSqs);
		int deleted = mapper.deleteBotApplications(projectSqs);
		for (ApplySeedRevokeResponseDTO.Sample s : counts) {
			mapper.addCandidateCnt(s.getProjectSq(), -s.getCount());
		}
		log.info("[apply-seed] 회수 지원={} 공고={}", deleted, counts.size());
		return ApplySeedRevokeResponseDTO.builder()
				.applications(deleted)
				.affectedProjects(counts.size())
				.samples(counts)
				.build();
	}
}
