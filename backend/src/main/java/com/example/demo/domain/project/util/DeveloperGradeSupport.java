package com.example.demo.domain.project.util;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.project.dto.response.DevGradeGroupResponse;

import lombok.RequiredArgsConstructor;

/**
 * 개발자 등급(공통코드 700)의 서열과 포함 관계를 다루는 곳.
 *
 * <p>
 * 등급은 두 층으로 되어 있다.
 * </p>
 * <ul>
 * <li><b>세부 9개</b> — {@code LOW_LOW}(초초) ~ {@code HIGH_HIGH}(상상)</li>
 * <li><b>대분류 3개</b> — {@code LOW}(초급) / {@code MID}(중급) / {@code HIGH}(상급).
 * 현장에서 "초급", "중급" 처럼 뭉뚱그려 오는 요청을 담으려고 추가했다</li>
 * <li><b>{@code ANY}(등급 무관)</b> — 등급을 따지지 않는 공고. 서열 밖이고 모든 등급을 포괄한다</li>
 * </ul>
 *
 * <p>
 * 🔴 <b>이 클래스가 생긴 이유.</b> 예전에는 {@code common_code_sq} 의 크기가 곧 등급 서열이라고
 * 가정하고 {@code min(Long::compareTo)} 로 최저 등급을 골랐다. 세부 9개가 701~709 라 우연히 맞았을 뿐이다.
 * 대분류를 710~712 로 추가하는 순간 {@code 710(초급) > 709(상상)} 이 되어 초급이 최고 등급으로 뒤집힌다.
 * {@code TBL_COMMON_CODE_C} 에는 정렬 순서 컬럼이 없으므로, 서열은 영문명에서 유도한다.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class DeveloperGradeSupport {

	/** 등급을 따지지 않는 공고의 영문명. 서열 비교 대상이 아니다. */
	public static final String ANY = "ANY";

	private static final Map<String, Integer> MAJOR_ORDER = Map.of("LOW", 0, "MID", 1, "HIGH", 2);

	private final CommonCodeMapper commonCodeMapper;

	/**
	 * 영문명의 서열. 낮을수록 낮은 등급이다.
	 *
	 * <pre>
	 *   LOW_LOW  → 0     LOW(초급)  → 0    ← 대분류는 그 구간의 하한을 갖는다
	 *   MID_LOW  → 3     MID(중급)  → 3
	 *   HIGH_LOW → 6     HIGH(상급) → 6      HIGH_HIGH → 8
	 * </pre>
	 *
	 * 대분류가 하한을 갖는 것은 대표 등급의 의미("이 등급부터 지원 가능")와 일치한다.
	 *
	 * @return 서열. {@code ANY} 이거나 규칙에 맞지 않으면 {@code null}
	 */
	public static Integer rankOf(String engNm) {
		if (engNm == null || engNm.isBlank() || ANY.equals(engNm)) {
			return null;
		}
		String[] parts = engNm.split("_");
		Integer major = MAJOR_ORDER.get(parts[0]);
		if (major == null) {
			return null;
		}
		if (parts.length == 1) {
			return major * 3;
		}
		Integer minor = MAJOR_ORDER.get(parts[1]);
		return minor == null ? null : major * 3 + minor;
	}

	/**
	 * 목록에 보여줄 순서.
	 *
	 * <p>
	 * 서열이 같으면 대분류를 먼저 둔다 — 대분류는 그 구간의 하한이라 세부 등급과 서열이 겹치는데,
	 * 그대로 두면 {@code 초초 · 초급 · 초중 · 초상} 처럼 대분류가 사이에 끼어 읽기 어렵다.
	 * {@code 초급 · 초초 · 초중 · 초상} 순이 되도록 한 칸 앞세운다.
	 * </p>
	 *
	 * @return 정렬 키. 서열 밖({@code ANY})이면 {@code null}
	 */
	public static Integer sortKeyOf(String engNm) {
		Integer rank = rankOf(engNm);
		if (rank == null) {
			return null;
		}
		boolean isMajor = !engNm.contains("_");
		return rank * 2 + (isMajor ? 0 : 1);
	}

	/**
	 * 이 등급이 포괄하는 <b>세부 등급</b>의 서열 집합.
	 *
	 * <p>
	 * 세부 등급은 자기 자신만, 대분류는 그 구간의 셋을, {@code ANY} 는 아홉 개 전부를 포괄한다.
	 * 두 등급의 이 집합이 겹치면 "서로 통하는 등급" 이다 — 검색 필터의 매칭 기준이 된다.
	 * </p>
	 */
	public static Set<Integer> coveredRanks(String engNm) {
		if (ANY.equals(engNm)) {
			Set<Integer> all = new LinkedHashSet<>();
			for (int i = 0; i < 9; i++) {
				all.add(i);
			}
			return all;
		}
		Integer rank = rankOf(engNm);
		if (rank == null) {
			return Set.of();
		}
		// 대분류(언더바 없음)면 구간 셋, 세부면 자기 자신.
		if (!engNm.contains("_")) {
			return Set.of(rank, rank + 1, rank + 2);
		}
		return Set.of(rank);
	}

	/**
	 * 「등급 무관」이 다른 등급과 섞여 있으면 막는다.
	 *
	 * <p>
	 * 등급을 따지지 않는다면서 특정 등급을 함께 적을 수는 없다. 프런트에서도 막지만
	 * API 를 직접 부르면 그만이라 여기서도 본다. 한글명을 하드코딩하지 않으려고
	 * 영문명({@code ANY})으로 판정한다.
	 * </p>
	 *
	 * @throws IllegalArgumentException 등급 무관이 다른 등급과 함께 왔을 때
	 */
	public void validateAnyGradeIsAlone(List<String> gradeNames) {
		if (gradeNames == null || gradeNames.size() < 2) {
			return;
		}
		Set<String> anyNames = loadMaster().stream()
				.filter(c -> ANY.equals(c.getCommonCodeEnglishNm()))
				.map(CommonCodeDTO::getCommonCodeNm)
				.collect(Collectors.toSet());

		boolean mixed = gradeNames.stream().anyMatch(anyNames::contains);
		if (mixed) {
			throw new IllegalArgumentException("「등급 무관」은 다른 등급과 함께 선택할 수 없습니다.");
		}
	}

	/** 등급 마스터 전체(활성). 13개뿐이라 그때그때 읽는다. */
	private List<CommonCodeDTO> loadMaster() {
		return commonCodeMapper.findActiveChildrenByParent(ParentCodeEnum.DEVELOPER_GRADE.getCode());
	}

	/**
	 * 등급 이름(한글) 목록을 서열 오름차순으로 정렬해 돌려준다.
	 *
	 * <p>
	 * 등록 폼의 {@code <select>} 와 검색 필터가 이 순서를 쓴다. 코드값 순으로 두면
	 * 나중에 추가된 대분류(초급·중급·상급)가 목록 맨 뒤로 밀려 읽기 어렵다.
	 * 서열이 없는 {@code ANY}(등급 무관)는 맨 뒤에 둔다.
	 * </p>
	 */
	public List<String> sortedGradeNames() {
		return loadMaster().stream()
				.sorted(Comparator.comparing(
						(CommonCodeDTO c) -> sortKeyOf(c.getCommonCodeEnglishNm()) == null ? Integer.MAX_VALUE
								: sortKeyOf(c.getCommonCodeEnglishNm()))
						.thenComparing(CommonCodeDTO::getCommonCodeSq))
				.map(CommonCodeDTO::getCommonCodeNm)
				.toList();
	}

	/** 대분류인가 — 영문명에 언더바가 없고 {@code ANY} 도 아닌 것(LOW/MID/HIGH). */
	private static boolean isMajor(String engNm) {
		return engNm != null && !engNm.contains("_") && !ANY.equals(engNm) && rankOf(engNm) != null;
	}

	/**
	 * 등록 폼용 두 층 구조 — 대분류 넷과 그 아래 세부 등급.
	 *
	 * <p>
	 * 13개를 한 목록에 늘어놓으면 너무 길어서, 기본은 대분류만 고르게 하고
	 * 「세부 등급 지정」을 켰을 때만 세부를 보여준다. 세부 등급은 마스터에 그대로 남아 있으므로
	 * 옛 공고의 {@code 중상} 같은 값도 계속 표시·검색된다.
	 * </p>
	 */
	public List<DevGradeGroupResponse> gradeGroups() {
		List<CommonCodeDTO> master = loadMaster();

		List<CommonCodeDTO> majors = master.stream()
				.filter(c -> isMajor(c.getCommonCodeEnglishNm()))
				.sorted(Comparator.comparing(c -> rankOf(c.getCommonCodeEnglishNm())))
				.toList();

		List<DevGradeGroupResponse> groups = new ArrayList<>();
		for (CommonCodeDTO major : majors) {
			// 그 대분류가 포괄하는 서열에 속하는 세부 등급들.
			Set<Integer> covered = coveredRanks(major.getCommonCodeEnglishNm());
			List<String> details = master.stream()
					.filter(c -> c.getCommonCodeEnglishNm() != null && c.getCommonCodeEnglishNm().contains("_"))
					.filter(c -> covered.contains(rankOf(c.getCommonCodeEnglishNm())))
					.sorted(Comparator.comparing(c -> rankOf(c.getCommonCodeEnglishNm())))
					.map(CommonCodeDTO::getCommonCodeNm)
					.toList();
			groups.add(new DevGradeGroupResponse(major.getCommonCodeNm(), details));
		}

		// 「등급 무관」은 세부가 없다. 맨 뒤에 둔다.
		master.stream()
				.filter(c -> ANY.equals(c.getCommonCodeEnglishNm()))
				.forEach(c -> groups.add(new DevGradeGroupResponse(c.getCommonCodeNm(), List.of())));

		return groups;
	}

	/**
	 * 검색 필터·목록에 보여줄 <b>대분류만</b>(초급·중급·상급·등급 무관).
	 *
	 * <p>
	 * 세부 등급으로 등록된 옛 공고도 대분류 필터에 걸린다 —
	 * {@link #expandForSearch(List)} 가 포함 관계로 넓히기 때문이다.
	 * </p>
	 */
	public List<?> majorFilterOptions(List<?> rawOptions) {
		if (rawOptions == null || rawOptions.isEmpty()) {
			return rawOptions;
		}
		Map<String, String> engNmByName = loadMaster().stream()
				.filter(c -> c.getCommonCodeEnglishNm() != null)
				.collect(Collectors.toMap(CommonCodeDTO::getCommonCodeNm, CommonCodeDTO::getCommonCodeEnglishNm));

		return rawOptions.stream()
				.filter(o -> {
					Object nm = (o instanceof Map<?, ?> row) ? row.get("common_code_nm") : null;
					String engNm = nm == null ? null : engNmByName.get(nm.toString());
					return engNm != null && (isMajor(engNm) || ANY.equals(engNm));
				})
				.sorted(Comparator.comparing(o -> {
					Object nm = (o instanceof Map<?, ?> row) ? row.get("common_code_nm") : null;
					String engNm = nm == null ? null : engNmByName.get(nm.toString());
					Integer rank = engNm == null ? null : rankOf(engNm);
					return rank == null ? Integer.MAX_VALUE : rank; // 등급 무관은 맨 뒤
				}))
				.toList();
	}

	/**
	 * 검색 필터 목록을 서열 순으로 정렬한다.
	 *
	 * <p>
	 * 등록 폼의 {@code <select>}({@link #sortedGradeNames()})와 같은 순서로 보이게 하려는 것이다.
	 * 필터 목록은 프런트가 {@code common_code_sq}/{@code common_code_nm} 키로 읽고 있어
	 * (다른 필터 3종도 같은 모양이다) 반환 형태를 바꾸지 않고 순서만 손본다.
	 * </p>
	 */
	public List<?> sortFilterOptionsByRank(List<?> rawOptions) {
		if (rawOptions == null || rawOptions.isEmpty()) {
			return rawOptions;
		}
		Map<String, Integer> sortKeyByName = loadMaster().stream()
				.filter(c -> sortKeyOf(c.getCommonCodeEnglishNm()) != null)
				.collect(Collectors.toMap(CommonCodeDTO::getCommonCodeNm,
						c -> sortKeyOf(c.getCommonCodeEnglishNm())));

		return rawOptions.stream()
				.sorted(Comparator.comparing(o -> {
					Object nm = (o instanceof Map<?, ?> row) ? row.get("common_code_nm") : null;
					Integer key = nm == null ? null : sortKeyByName.get(nm.toString());
					// 서열이 없는 것(등급 무관)은 맨 뒤로.
					return key == null ? Integer.MAX_VALUE : key;
				}))
				.toList();
	}

	/**
	 * 등급 이름들 중 <b>가장 낮은 등급</b>의 코드.
	 *
	 * <p>
	 * {@code TBL_PROJECT_M.project_developer_grade_cd}(대표 등급)에 넣을 값이다.
	 * 등급 무관만 있으면 등급 무관의 코드를 그대로 쓴다.
	 * </p>
	 *
	 * @return 대표 등급 코드. 넘어온 이름이 하나도 마스터에 없으면 {@code null}
	 */
	public Long resolveLowestGradeCd(List<String> gradeNames) {
		if (gradeNames == null || gradeNames.isEmpty()) {
			return null;
		}
		Set<String> wanted = gradeNames.stream()
				.filter(n -> n != null && !n.isBlank())
				.collect(Collectors.toSet());
		if (wanted.isEmpty()) {
			return null;
		}

		List<CommonCodeDTO> matched = loadMaster().stream()
				.filter(c -> wanted.contains(c.getCommonCodeNm()))
				.toList();
		if (matched.isEmpty()) {
			return null;
		}

		// 서열이 있는 것 중 최저. 전부 서열 밖(등급 무관)이면 그것을 그대로 쓴다.
		return matched.stream()
				.filter(c -> rankOf(c.getCommonCodeEnglishNm()) != null)
				.min(Comparator.comparing(c -> rankOf(c.getCommonCodeEnglishNm())))
				.map(CommonCodeDTO::getCommonCodeSq)
				.orElseGet(() -> matched.get(0).getCommonCodeSq());
	}

	/**
	 * 검색 필터의 등급 코드를 <b>포함 관계로 확장</b>한다.
	 *
	 * <p>
	 * 「초급」으로 등록된 공고는 초초·초중·초상을 모두 포함하므로, 구직자가 「초초」로 걸러도 나와야 한다.
	 * 반대도 같다. 그래서 고른 등급과 <b>포괄 범위가 겹치는</b> 등급을 전부 조건에 넣는다.
	 * </p>
	 *
	 * <pre>
	 *   초급(710) → 710, 701, 702, 703, 713
	 *   초초(701) → 701, 710, 713
	 *   등급무관(713) → 713 만 (등급을 안 따지는 공고를 콕 집어 찾는 것이므로 넓히지 않는다)
	 * </pre>
	 *
	 * @return 확장된 코드 목록. 입력이 비어 있으면 그대로 돌려준다(필터 없음)
	 */
	public List<Long> expandForSearch(List<Long> selectedCds) {
		if (selectedCds == null || selectedCds.isEmpty()) {
			return selectedCds;
		}

		List<CommonCodeDTO> master = loadMaster();
		Map<Long, String> engNmByCd = master.stream()
				.filter(c -> c.getCommonCodeEnglishNm() != null)
				.collect(Collectors.toMap(CommonCodeDTO::getCommonCodeSq, CommonCodeDTO::getCommonCodeEnglishNm));

		// 「등급 무관」만 고른 경우는 넓히지 않는다.
		boolean onlyAny = selectedCds.stream()
				.allMatch(cd -> ANY.equals(engNmByCd.get(cd)));
		if (onlyAny) {
			return selectedCds;
		}

		Set<Integer> wantedRanks = selectedCds.stream()
				.map(engNmByCd::get)
				.filter(Objects::nonNull)
				.flatMap(engNm -> coveredRanks(engNm).stream())
				.collect(Collectors.toSet());

		List<Long> expanded = new ArrayList<>(new LinkedHashSet<>(selectedCds));
		for (CommonCodeDTO code : master) {
			if (expanded.contains(code.getCommonCodeSq())) {
				continue;
			}
			String engNm = code.getCommonCodeEnglishNm();
			// 등급 무관 공고는 모든 등급을 받아들이므로 어떤 필터에도 걸려야 한다.
			if (ANY.equals(engNm)
					|| coveredRanks(engNm).stream().anyMatch(wantedRanks::contains)) {
				expanded.add(code.getCommonCodeSq());
			}
		}
		return expanded;
	}
}
