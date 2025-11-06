package com.example.demo.domain.community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Reply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long replyCommentSq;
    private Long commentSq;
    private Long boardSq;
    private Long userSq;
    private String replyCommentDescriptionTxt;
    private LocalDateTime replyCommentCreatedAtDtm;
    private LocalDateTime replyCommentModifiedAtDtm;
    private Integer replyCommentRecommendCnt;
    private String replyCommentIsDeletedYn;
}
