package com.example.demo.domain.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 봇 이력서 주소에 넣을 시군구 코드. */
@Getter
@Setter
@NoArgsConstructor
public class ApplySeedAreaDTO {
    private Long areaCodeSq;
    private String sigungu;
}
