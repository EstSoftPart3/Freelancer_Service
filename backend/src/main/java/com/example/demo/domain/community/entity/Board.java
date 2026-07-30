package com.example.demo.domain.community.entity;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Board {
    private Long boardSq;
    private Long userSq;
    private String boardTtl;
    private String boardDescriptionEdt;
    private Integer boardViewCnt;
    private Integer boardCommentCnt;
    private Integer boardRecommendCnt;
    private Long boardAdoptStatusCd;
    private String boardIsDeletedYn;
    private String boardTyp;
    private Long boardTypeCd;
    /** 게시판 카테고리 (공통코드 3200 하위). NULL = 미분류 — 카테고리 도입 전 글은 전부 NULL이다. */
    private Long boardCategoryCd;
    /**
     * 카테고리 표시명. TBL_BOARD_M 의 컬럼이 아니라 조회 시 공통코드에서 JOIN 해 채운다
     * (INSERT/UPDATE 문에는 넣지 않는다). 라벨의 유일한 출처를 공통코드로 두기 위한 필드다.
     */
    private String boardCategoryNm;
    /**
     * 비공개 여부 ('Y'/'N'). 고객의 소리(1404)에서만 'Y'가 될 수 있고 나머지 게시판은 항상 'N'이다.
     * DB 기본값이 'N'이라 카테고리 도입 전 글도 전부 'N'으로 채워져 있다.
     */
    private String boardIsSecretYn;
    private LocalDateTime boardCreatedAtDtm;
}
