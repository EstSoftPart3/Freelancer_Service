package com.example.demo.domain.community.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommonCodeDTO {
    private Long commonCodeSq; // 코드 순번
    private String commonCodeNm; // 코드 이름 (예: 욕설/비방)
    private String commonCodeEnglishNm; // 코드 영문 이름 (예: LOW_LOW). 개발자 등급의 서열 판정에 쓴다
    private Long parentCommonCodeSq; // 부모 코드 순번
}