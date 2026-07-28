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

    NORMAL(1401L, "normal"),
    QNA(1402L, "qna"),
    NOTICE(1403L, "notice"),
    /** 고객의 소리 — Phase 5에서 사용. 공통코드 1404. */
    VOC(1404L, "voc");

    private final Long code;
    /** TBL_BOARD_M.board_typ 에 저장되는 문자열. FO 라우트 경로(/qna, /notice)와도 일치한다. */
    private final String typ;

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
}
