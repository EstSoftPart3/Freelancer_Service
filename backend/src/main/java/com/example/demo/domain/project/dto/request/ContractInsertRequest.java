package com.example.demo.domain.project.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ContractInsertRequest {
    private Long projectSq;
    private Long contractTypeCd;
}