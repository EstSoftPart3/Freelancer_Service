package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;
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
public class AdminFaqDetailResponseDTO {    
	private Long faqSq;                 	// FAQ PK
    private Long faqTypeCd;           	 	// 카테고리 코드
    private String categoryNm;          	// 카테고리 이름
    private String questionTtl;          	// 질문 제목 (ERD 물리명 유지)
    private String answerCn;            	// 답변 내용
    private LocalDateTime faqCreatedAtDtm;  // 등록 일시
    private LocalDateTime modifiedAt;		// 수정 일시
    private String isDeletedYn;  			// 삭제 여부 (상태 표시용)
}