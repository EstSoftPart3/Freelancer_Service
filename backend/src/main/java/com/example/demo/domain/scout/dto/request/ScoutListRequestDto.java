package com.example.demo.domain.scout.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScoutListRequestDto {
	
	private String status;
    private Integer page = 0; // 기본값 0
    private Integer size = 10; // 기본값 10
    private String searchType;
    private String keyword;

    public int getOffset() {
        return this.page * this.size;
    }

}
