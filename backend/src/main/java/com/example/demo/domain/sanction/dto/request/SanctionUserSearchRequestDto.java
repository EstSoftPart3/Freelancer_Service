package com.example.demo.domain.sanction.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SanctionUserSearchRequestDto {
	private Integer page = 1;
    private Integer size = 10;
    private String searchKeyword;
    private String userType;

    public int getOffset() {
        return (this.page - 1) * this.size;
    }
}
