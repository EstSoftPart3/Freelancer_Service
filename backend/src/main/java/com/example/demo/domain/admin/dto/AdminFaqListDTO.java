package com.example.demo.domain.admin.dto;

import java.util.List;
import com.example.demo.domain.admin.dto.response.AdminFaqDetailResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFaqListDTO {
	private Long page;              // 현재 페이지
    private Long size;              // 페이지 사이즈
    private Long totalElements;     // 전체 개수
    private List<AdminFaqDetailResponseDTO> faqs;
}