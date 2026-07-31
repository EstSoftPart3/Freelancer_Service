package com.example.demo.domain.community.constant;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

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
 * 테이블 컬럼 구조는 그대로 둔다 — 컬럼을 없애는 건 전 도메인 회귀 테스트가 필요한
 * 별개의 작업이고, Phase 1 의 범위는 "코드단에서 단일화"까지다.
 * </p>
 */
@Getter
@RequiredArgsConstructor
public enum BoardTypeCode {

    NORMAL(1401L, "normal", "board"),
    QNA(1402L, "qna", "qna"),
    NOTICE(1403L, "notice", "notice"),
    /** 고객의 소리 — Phase 5에서 사용. 공통코드 1404. */
    VOC(1404L, "voc", "voc");

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

    public static BoardTypeCode fromCode(Long code) {
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("알 수 없는 게시판 구분 코드입니다: " + code));
    }

    /**
     * 알 수 없는 코드도 일단 일반게시판으로 취급한다.
     * 기존 {@code BoardService.createBoard} 가 그렇게 동작했으므로 그 행동을 보존한다.
     */
    public static String typOf(Long code) {
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElse(NORMAL)
                .getTyp();
    }

    /**
     * {@code board_typ} 문자열로 FO 상세 경로 접두를 만든다 (예: {@code "voc"} → {@code "/voc/"}).
     * 알 수 없는 값은 일반게시판으로 본다 — 알림 링크가 깨지느니 게시판 목록으로 가는 편이 낫다.
     */
    public static String pathPrefixOfTyp(String typ) {
        return "/" + Arrays.stream(values())
                .filter(t -> t.typ.equals(typ))
                .findFirst()
                .orElse(NORMAL)
                .getPath() + "/";
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
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElse(NORMAL)
                .getPath();
    }

    /** 코드로 경로 접두를 만든다. {@link #pathPrefixOfTyp(String)} 의 숫자 버전. */
    public static String pathPrefixOfCode(Long code) {
        return "/" + Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElse(NORMAL)
                .getPath() + "/";
    }
}
