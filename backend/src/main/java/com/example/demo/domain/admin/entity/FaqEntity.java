package com.example.demo.domain.admin.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "TBL_FAQ_M")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "faq_sq")
	private Long faqSq;        // faq_sq (PK)
	
	@Column(name = "faq_type_cd", nullable = false)
    private Long faqTypeCd;             // faq_type_cd (FK)
	
	@Column(name = "question_ttl", nullable = false, length = 100)
    private String questionTtl; 
	
	@Column(name = "answer_cn", nullable = false, columnDefinition = "LONGTEXT")
    private String answerCn;
	
	@Column(name = "faq_created_at_dtm", nullable = false, updatable = false)
    private LocalDateTime faqCreatedAtDtm;     
	
	@Column(name = "faq_modified_at_dtm", nullable = false)
    private LocalDateTime faqModifiedAtDtm;
	
	@Column(name = "faq_is_deleted_yn", length = 1)
    private String faqIsDeletedYn;
	
	@Transient
    private String categoryNm; // MyBatis 조인 결과 또는 화면 표시용 (DB 컬럼 아님)
    
	
	/**
     * 기본값 설정
     */
	@PrePersist
    public void prePersist() {
        this.faqCreatedAtDtm = LocalDateTime.now();
        this.faqModifiedAtDtm = LocalDateTime.now();
        this.faqIsDeletedYn = "N";
    }
	
	/**
     * 엔터티가 수정되기 전 수정시간 갱신
     */
    @PreUpdate
    public void preUpdate() {
        this.faqModifiedAtDtm = LocalDateTime.now();
    }
    
    /**
     * FAQ 삭제 (논리 삭제)
     */
    public void delete() {
        this.faqIsDeletedYn = "Y";
    }
    
    /**
     * FAQ 수정 로직
     */
    public void update(Long faqTypeCd, String title, String content) {
        this.faqTypeCd = faqTypeCd;
        this.questionTtl = title;
        this.answerCn = content;
    }
}
