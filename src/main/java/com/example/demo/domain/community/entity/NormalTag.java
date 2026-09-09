package com.example.demo.domain.community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NormalTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long normalTagSq;
    private Long boardSq;
    private Long answerSq;
    private String normalTagNm;
    private Long normalTagTypeCd;
}
