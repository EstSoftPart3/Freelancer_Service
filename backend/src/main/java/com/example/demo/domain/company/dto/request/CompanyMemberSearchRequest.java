package com.example.demo.domain.company.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CompanyMemberSearchRequest extends BaseRequest{
	private String searchType;
	private String keyword;
}
