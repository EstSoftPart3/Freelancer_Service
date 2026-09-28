package com.example.demo.domain.vote.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteOptionResultDTO {
    private Long voteOptionSq;
    private String voteOptionNm;
    private Integer voteOptionOrder;
    private Long voteCnt;
}
