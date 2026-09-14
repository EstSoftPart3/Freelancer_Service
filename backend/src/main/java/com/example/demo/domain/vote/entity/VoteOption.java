package com.example.demo.domain.vote.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteOption {
    private Long voteOptionSq;
    private Long voteSq;
    private String voteOptionNm;
    private Integer voteOptionOrder;
}
