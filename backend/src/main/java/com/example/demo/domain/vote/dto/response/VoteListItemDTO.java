package com.example.demo.domain.vote.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteListItemDTO {
    private Long voteSq;
    private String voteTtl;
    private Long userSq;
    private String userNickname;
    private Long voteCategoryCd;
    private LocalDateTime voteEndDt;
    private LocalDateTime voteCreatedAtDtm;
    private Integer voteViewCnt;
    private Long optionCnt;
    private Long totalVoteCnt;
    // BO 목록 전용 — FO 응답에서는 항상 null(findAll 이 이미 vote_is_deleted_yn='N' 만 조회).
    private String voteIsDeletedYn;
}
