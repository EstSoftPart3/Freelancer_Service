package com.example.demo.domain.community.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 커뮤니티 베스트글/인기글/추천글 공용 응답 — 조회수·추천수·댓글수 복합 점수 기준.
 * 목록/N+1을 유발하는 태그는 포함하지 않는다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityBestItemDTO {
    private Long sq;
    private String boardType; // "board" | "qna"
    private String ttl;
    private String userNickname;
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private LocalDateTime createdAt;
    private Long score;
}
