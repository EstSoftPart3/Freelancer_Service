package com.example.demo.domain.community.dto.request;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
public class CommentRequest {
    private Long userSq;
    private Long parentCommentSq; // 부모 댓글 번호 추가
    private Long boardSq;
    private Long answerSq;
    private String description;
}