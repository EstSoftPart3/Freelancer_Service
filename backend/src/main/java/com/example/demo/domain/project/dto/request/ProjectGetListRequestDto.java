package com.example.demo.domain.project.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectGetListRequestDto {  // Searchrequest
	private String status; // 전체, 진행중, 완료  (탭 구분용)
	private String keyword;	//검색용
	private int page = 1;
	private int size = 10;
	
	public int getOffset() {
		return (page - 1) * size;
	}

}
