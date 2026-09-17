package com.example.demo.domain.vote.entity;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Vote {
    private Long voteSq;
    private Long userSq;
    // TBL_USER_M 조인 전용 — insert 시에는 쓰지 않는다.
    private String userNickname;
    private String voteTtl;
    private String voteDescriptionEdt;
    // 공통코드 3250(IT) / 3251(일반) — parent 1410(투표_카테고리).
    private Long voteCategoryCd;
    private LocalDateTime voteEndDt;
    private Integer voteViewCnt;
    private String voteIsDeletedYn;
    private LocalDateTime voteCreatedAtDtm;
}
