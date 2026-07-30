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
    private LocalDateTime boardCreatedAtDtm;
}
