package com.example.demo.domain.community.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommonCodeDTO {
    private Long commonCodeSq; // 코드 순번
    private String commonCodeNm; // 코드 이름 (예: 욕설/비방)
    private Long parentCommonCodeSq; // 부모 코드 순번
}