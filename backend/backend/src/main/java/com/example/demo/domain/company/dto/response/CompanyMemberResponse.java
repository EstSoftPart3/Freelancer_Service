package com.example.demo.domain.company.dto.response;

import java.util.List;

import com.example.demo.domain.company.dto.CompanyMemberVo;

import lombok.AllArgsConstructor;
import lombok.Getter;


@AllArgsConstructor
@Getter
public class CompanyMemberResponse {
	private Integer page;
    private Integer size;
    private Long totalCount;
    private Integer totalPages; 
    private List<CompanyMemberVo> members;
}
