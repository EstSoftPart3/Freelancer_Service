package com.example.demo.domain.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFaqCreateRequestDTO {
	
	@NotNull(message = "카테고리는 필수 선택입니다.")
	private Long faqTypeCd;      	// 카테고리명 (3001~3005)
	
	@NotBlank(message = "질문 제목을 입력해주세요.")
    @Size(max = 100, message = "제목은 100자 이내로 입력해주세요.")
    private String questionTtl;     // 질문 제목
	
	@NotBlank(message = "답변 내용을 입력해주세요.")
    private String answerCn;		// 답변 내용
	
	@NotBlank(message = "노출 여부는 필수 입니다.")
    private String faqIsDeletedYn;  // 삭제 여부
}
