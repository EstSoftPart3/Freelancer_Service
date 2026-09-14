package com.example.demo.domain.vote.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteCreateRequest {
    private Long userSq;
    private String voteTtl;
    private String voteDescriptionEdt;
    private LocalDateTime voteEndDt;
    private List<String> options;
}
