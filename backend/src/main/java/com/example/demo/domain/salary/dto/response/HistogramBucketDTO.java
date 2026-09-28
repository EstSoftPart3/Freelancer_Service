package com.example.demo.domain.salary.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistogramBucketDTO {
    private Integer from;
    private Integer to;
    private Integer count;
    // Lombok이 boolean isMine 필드에 isMine() 게터를 만들면 Jackson이 "is"를 잘라
    // JSON 키가 "mine"이 돼버린다(프론트 HistogramBucket.isMine과 어긋남) — 명시적으로 고정.
    @JsonProperty("isMine")
    private boolean isMine;
}
