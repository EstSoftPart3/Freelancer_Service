package com.example.demo.domain.project.dto.request;

import com.example.demo.domain.company.dto.request.BaseRequest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CompanyFilterRequest extends BaseRequest{
	private String searchType;
	private String keyword;
	private String status;
}
