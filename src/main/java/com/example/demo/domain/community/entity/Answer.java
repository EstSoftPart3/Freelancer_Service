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
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerSq;
    private Long userSq;
    private Long boardSq;
    private String answerTtl;
    private String answerDescriptionEdt;
    private Integer answerViewCnt;
    private Integer answerCommentCnt;
    private Integer answerRecommendCnt;
    private String answerIsAdoptedYn;
    private String answerIsDeletedYn;
    private LocalDateTime answerCreatedAtDtm;
}
