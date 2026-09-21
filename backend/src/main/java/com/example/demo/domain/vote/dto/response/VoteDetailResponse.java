package com.example.demo.domain.vote.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteDetailResponse {
    private Long voteSq;
    private String voteTtl;
    private String voteDescriptionEdt;
    private Long userSq;
    private String userNickname;
    private Long voteCategoryCd;
    private LocalDateTime voteEndDt;
    private LocalDateTime voteCreatedAtDtm;
    private Integer voteViewCnt;
    private boolean closed;
    private Long totalVoteCnt;
    private Long myVoteOptionSq;
    private List<VoteOptionResultDTO> options;
    // BO 상세 전용 — FO 응답에서는 항상 null(getVote 가 삭제된 투표를 404 로 막는다).
    private String voteIsDeletedYn;
}
