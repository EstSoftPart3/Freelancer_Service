package com.example.demo.domain.community.constant;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import lombok.Getter;

/**
 * 게시판 구분 코드 (공통코드 부모 1400).
 *
 * <p>
 * TBL_BOARD_M 은 같은 정보를 두 컬럼에 중복 보관한다 — 숫자 {@code board_type_cd} 와
 * 문자열 {@code board_typ}. 지금까지는 서비스마다 {@code if (cd == 1402L) "qna"} 같은
 * 분기를 직접 써서 둘의 대응 관계가 코드 여러 곳에 흩어져 있었다.
 * 이 enum 이 그 대응을 한 곳에서 책임진다.
 * </p>
 *
 * <p>
 * Phase2 게시판 재설계(2026-09) — 게시판 종류가 4종에서 늘어날 예정이라, "이 종류가
 * 답변/채택을 지원하는가" 같은 개별 {@code == QNA} 비교를 capability 플래그로 옮겼다.
 * 새 게시판 종류를 추가할 때는 플래그 값만 정하면 되고, {@code BoardService}·매퍼의
 * 개별 분기를 더 손대지 않아도 되는 것이 목표다.
 * </p>
 *
 * <p>
 * 테이블 컬럼 구조는 그대로 둔다 — 컬럼을 없애는 건 전 도메인 회귀 테스트가 필요한
 * 별개의 작업이고, Phase 1 의 범위는 "코드단에서 단일화"까지다.
 * </p>
 */
@Getter
public enum BoardTypeCode {

    NORMAL(1401L, "normal", "board", true, true, false, true, true, false, false),
    QNA(1402L, "qna", "qna", true, false, false, true, true, false, false),
    NOTICE(1403L, "notice", "notice", false, false, false, false, false, true, false),
    /** 고객의 소리 — Phase 5에서 사용. 공통코드 1404. */
    VOC(1404L, "voc", "voc", false, false, true, false, false, false, true),

    // ── Phase2 게시판 재설계(2026-09) 신설 5종. NORMAL·QNA는 데이터를 전부 이관하고
    // 공통코드를 비활성화했다(빈 껍데기로 남김) — 컬럼 삭제는 별개 작업이라 enum엔 남겨둔다. ──
    /** 커리어소통 — 연봉(3210)·이직(3211) 중분류. 옛 일반게시판 "커리어"(3203) 글 105건 이관. */
    CAREER(1405L, "career", "career", true, true, false, false, true, false, false),
    /** 기술소통 — 개발(3220)·AI(3221) 중분류. 옛 "기술"(3205) 105건 + 옛 QnA 150건 이관. */
    TECH(1406L, "tech", "tech", true, true, false, true, true, false, false),
    /** 요즘회사 — 중분류 없음(단일). */
    COMPANY(1407L, "company", "company", true, false, false, false, false, false, false),
    /** 프로젝트 — 프로젝트 의뢰(3230)·팀원모집(3231) 중분류. 기존 /projects 도메인과는 별개(네비게이션만 편입). */
    TEAMUP(1408L, "teamup", "teamup", true, true, false, false, false, false, false),
    /** 라운지(자유) — 말머리(3240)·잡담(3241) 중분류. 옛 "자유"(3201) 105건 이관. */
    LOUNGE(1409L, "lounge", "lounge", true, true, false, false, false, false, false);

    private final Long code;
    /** TBL_BOARD_M.board_typ 에 저장되는 문자열. */
    private final String typ;
    /**
     * FO 상세 페이지 경로 세그먼트. 알림 링크를 만들 때 쓴다.
     * 일반게시판만 {@code typ}("normal")과 경로("board")가 다르다 — 이 어긋남 때문에
     * 알림 코드마다 {@code "normal".equals(typ) ? "/board/" : "/qna/"} 삼항식이 복제돼 있었고,
     * 게시판이 늘 때마다 그 삼항식이 조용히 틀린 링크를 만들었다.
     */
    private final String path;

    // ── capability 플래그 ──────────────────────────────────────────────
    /** 통합목록(/community/boards, boardType=all)에 포함되는가. */
    private final boolean inCommunityList;
    /** 카테고리(공통코드 3200 그룹, 중분류)를 갖는가. */
    private final boolean hasCategory;
    /** 비공개(secret) 글을 쓸 수 있는가. */
    private final boolean supportsSecret;
    /** 기술 태그를 붙일 수 있는가. */
    private final boolean supportsSkillTag;
    /** 답변 + 채택 상태 변경을 지원하는가. */
    private final boolean supportsAnswer;
    /** 관리자만 쓸 수 있는가(등록/수정/삭제 FO API 없음). */
    private final boolean adminWriteOnly;
    /** 목록·상세 조회에 로그인이 필요한가. */
    private final boolean requiresAuth;

    BoardTypeCode(Long code, String typ, String path, boolean inCommunityList, boolean hasCategory,
            boolean supportsSecret, boolean supportsSkillTag, boolean supportsAnswer, boolean adminWriteOnly,
            boolean requiresAuth) {
        this.code = code;
        this.typ = typ;
        this.path = path;
        this.inCommunityList = inCommunityList;
        this.hasCategory = hasCategory;
        this.supportsSecret = supportsSecret;
        this.supportsSkillTag = supportsSkillTag;
        this.supportsAnswer = supportsAnswer;
        this.adminWriteOnly = adminWriteOnly;
        this.requiresAuth = requiresAuth;
    }

    /**
     * 알 수 없는 코드도 일단 일반게시판으로 취급한다.
     * 기존 {@code BoardService.createBoard} 가 그렇게 동작했으므로 그 행동을 보존한다.
     */
    public static String typOf(Long code) {
        return of(code).getTyp();
    }

    /**
     * {@code board_typ} 문자열로 FO 상세 경로 접두를 만든다 (예: {@code "voc"} → {@code "/voc/"}).
     * 알 수 없는 값은 일반게시판으로 본다 — 알림 링크가 깨지느니 게시판 목록으로 가는 편이 낫다.
     */
    public static String pathPrefixOfTyp(String typ) {
        return "/" + ofTyp(typ).getPath() + "/";
    }

    /**
     * 코드 → FO 경로 세그먼트 ({@code 1404 → "voc"}).
     *
     * <p>
     * 목록 응답의 {@code boardType} 이 이 값이다. FO 는 이것으로 상세 링크를 만들기 때문에
     * 여기서 틀리면 <b>엉뚱한 게시판 상세로 이동해 400</b> 이 난다 —
     * 실제로 {@code 1402면 qna 아니면 board} 라는 삼항식 때문에 고객의 소리 글이
     * {@code /board/{sq}} 로 가서 "게시글이 존재하지 않습니다"가 떴다.
     * </p>
     */
    public static String pathOfCode(Long code) {
        return of(code).getPath();
    }

    /** 코드로 enum을 찾는다. 알 수 없는 코드는 NORMAL로 폴백한다(기존 동작 보존). */
    public static BoardTypeCode of(Long code) {
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElse(NORMAL);
    }

    /** FO 라우트 세그먼트({@code path})로 enum을 찾는다. 알 수 없는 값은 NORMAL로 폴백한다. */
    public static BoardTypeCode ofPath(String path) {
        return Arrays.stream(values())
                .filter(t -> t.path.equals(path))
                .findFirst()
                .orElse(NORMAL);
    }

    /** {@code board_typ} 문자열로 enum을 찾는다. 알 수 없는 값은 NORMAL로 폴백한다. */
    public static BoardTypeCode ofTyp(String typ) {
        return Arrays.stream(values())
                .filter(t -> t.typ.equals(typ))
                .findFirst()
                .orElse(NORMAL);
    }

    /** 통합목록(전체보기)에 포함되는 게시판 종류의 코드 목록. */
    public static List<Long> communityListCodes() {
        return Arrays.stream(values())
                .filter(BoardTypeCode::isInCommunityList)
                .map(BoardTypeCode::getCode)
                .collect(Collectors.toList());
    }

    /**
     * 관리자 대시보드 게시글 지표에 포함할 코드 목록 — 통합목록(communityListCodes) + 공지.
     * 고객의 소리는 뺀다(1:1 문의라 커뮤니티 활동량이 아니다).
     */
    public static List<Long> dashboardTypeCds() {
        List<Long> codes = new java.util.ArrayList<>(communityListCodes());
        codes.add(NOTICE.getCode());
        return codes;
    }
}
