package com.example.demo.domain.community.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NormalTag {
    private Long normalTagSq;
    private Long boardSq;
    private Long answerSq;
    private String normalTagNm;
    private Long normalTagTypeCd;
}
