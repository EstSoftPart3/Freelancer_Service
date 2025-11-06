package com.example.demo.domain.community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportSq;
    private Long userSq;
    private Long boardSq;
    private Long answerSq;
    private Long commentSq;
    // 인턴 추가 : 대댓글
    private Long replyCommentSq;
    private String reportReasonTxt;
    private Long reportTypeCd;
}
