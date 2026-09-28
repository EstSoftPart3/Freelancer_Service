package com.example.demo.domain.admin.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminVoteUpdateRequestDTO {
    private String voteTtl;
    private String voteDescriptionEdt;
    private Long voteCategoryCd;
    private LocalDateTime voteEndDt;
    // null 이면 선택지는 그대로 둔다. 참여자(TBL_VOTE_RECORD_S)가 이미 있는 투표는
    // 값을 보내도 AdminVoteService 가 409 로 막는다(결과 집계 무결성 보호, 사용자 확정 정책).
    private List<String> options;
}
