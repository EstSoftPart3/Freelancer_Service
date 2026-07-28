package com.example.demo.domain.community.constant;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 게시판 카테고리 코드 (공통코드 부모 3200) — Phase 1 신설, Phase 4에서 사용.
 *
 * <p>
 * {@code board_type_cd} 에 값을 더하는 대신 {@code board_category_cd} 신규 컬럼을 쓴다.
 * 타입 코드에 값을 추가하면 {@code BoardMapper.findBestBoards} 의 {@code IN (1401,1402)},
 * 컨트롤러의 하드코딩 상수, FO 의 {@code BoardType} 유니온까지 전부 건드려야 하지만,
 * 신규 컬럼은 순수 가산이고 기존 데이터는 NULL(= 자유로 해석)로 남는다.
 * </p>
 *
 * <p>
 * 번호대가 3200인 이유: 1600대는 이미 "댓글_구분"으로 사용 중이고, 실사 시점 최대 코드가
 * 3103(발신자 타입)이었다.
 * </p>
 */
@Getter
@RequiredArgsConstructor
public enum BoardCategoryCode {

    FREE(3201L, "자유"),
    GENERAL(3202L, "일반"),
    FIELD_INFO(3203L, "현장정보"),
    FEATURE_REQUEST(3204L, "기능요청");

    private final Long code;
    private final String label;

    public static BoardCategoryCode fromCode(Long code) {
        return Arrays.stream(values())
                .filter(c -> c.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("알 수 없는 게시판 카테고리 코드입니다: " + code));
    }

    /** 카테고리는 선택값이라 null(미분류)이 정상이다. 이 경우 기본값 '자유'로 본다. */
    public static String labelOf(Long code) {
        if (code == null) {
            return FREE.label;
        }
        return Arrays.stream(values())
                .filter(c -> c.code.equals(code))
                .findFirst()
                .orElse(FREE)
                .getLabel();
    }

    public static boolean isValid(Long code) {
        return code != null && Arrays.stream(values()).anyMatch(c -> c.code.equals(code));
    }
}
