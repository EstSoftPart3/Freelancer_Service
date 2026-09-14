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
    private LocalDateTime voteEndDt;
    private LocalDateTime voteCreatedAtDtm;
    private Integer voteViewCnt;
    private Long optionCnt;
    private Long totalVoteCnt;
}
