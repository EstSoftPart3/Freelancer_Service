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
    private LocalDateTime boardCreatedAtDtm;
}
