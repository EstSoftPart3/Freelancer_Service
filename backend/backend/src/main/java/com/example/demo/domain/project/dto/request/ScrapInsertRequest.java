package com.example.demo.domain.project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ScrapInsertRequest {
    private Long userSq;
    private Long projectSq;
    private Long scrapTypeCd;
}