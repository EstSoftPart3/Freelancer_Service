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
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentSq;
    private Long userSq;
    private Long boardSq;
    private Long answerSq;
    private String commentDescriptionTxt;
    private LocalDateTime commentCreatedAtDtm;
    private Integer commentRecommendCnt;
    private String commentIsDeletedYn;
    private Long commentTypeCd;
}
