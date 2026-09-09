package com.example.demo.domain.company.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BaseRequest {
	@NotNull(message = "페이지 번호(offset)는 필수입니다.")
    @Min(value = 1, message = "페이지 번호는 1 이상이어야 합니다.")
    private Integer page;

    @NotNull(message = "페이지 크기(size)는 필수입니다.")
    @Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다.")
    private Integer size;
    
    public int getOffset() {
        return (page != null && size != null) ? (Math.max(page, 1) - 1) * size : 0;
    }
}
