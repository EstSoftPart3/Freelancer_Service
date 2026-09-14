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
    private LocalDateTime voteEndDt;
    private Integer voteViewCnt;
    private String voteIsDeletedYn;
    private LocalDateTime voteCreatedAtDtm;
}
