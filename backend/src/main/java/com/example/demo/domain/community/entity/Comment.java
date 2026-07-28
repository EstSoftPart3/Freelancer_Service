package com.example.demo.domain.community.entity;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
    private Long commentSq;
    private Long parentCommentSq; // 부모 댓글 번호 추가
    private Long userSq;
    private Long boardSq;
    private Long answerSq;
    private String commentDescriptionTxt;
    private LocalDateTime commentCreatedAtDtm;
    private Integer commentRecommendCnt;
    private String commentIsDeletedYn;
    private Long commentTypeCd;
}
