package com.example.demo.domain.admin.service;

import com.example.demo.domain.admin.constant.FaqType;
import com.example.demo.domain.admin.dto.AdminFaqListDTO;
import com.example.demo.domain.admin.dto.request.AdminFaqCreateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminFaqDetailResponseDTO;
import com.example.demo.domain.admin.entity.FaqEntity;
import com.example.demo.domain.admin.mapper.AdminFaqMapper;
import com.example.demo.domain.affiliation.dto.request.SearchFilterRequest;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminFaqService {

    private final AdminFaqMapper adminFaqMapper;

    /**
     * FAQ 목록 조회
     */
    @Transactional(readOnly = true)
    public AdminFaqListDTO getFaqList(SearchFilterRequest request) {
              
    	// 1. DB에서 데이터와 전체 카운트 조회
        List<AdminFaqDetailResponseDTO> faqs = adminFaqMapper.findAll(request);
        Long totalElements = adminFaqMapper.countAll(request);
        
        faqs.forEach(item -> {
            item.setCategoryNm(FaqType.getNameByCode(item.getFaqTypeCd()));
        });
        
        return AdminFaqListDTO.builder()
        		.page(request.getPage())
        		.size(request.getSize())
        		.totalElements(totalElements)
        		.faqs(faqs)
        		.build();
    }

    /**
     * FAQ 상세 조회
     */
    @Transactional(readOnly = true)
    public AdminFaqDetailResponseDTO getFaqDetail(Long faqSq) {
    	
    	AdminFaqDetailResponseDTO detail = adminFaqMapper.findBySq(faqSq);
    	
    	if (detail == null) {
            throw new IllegalArgumentException("존재하지 않는 FAQ 게시글입니다. (번호: " + faqSq + ")");
        }
    	
    	detail.setCategoryNm(FaqType.getNameByCode(detail.getFaqTypeCd()));
    	
        return detail;
    }

    /**
     * FAQ 등록
     */
    @Transactional
    public void registerFaq(AdminFaqCreateRequestDTO dto) {
    	
    	// 1.카테고리 번호 검증
    	if (!FaqType.isValidCode(dto.getFaqTypeCd())) {
            throw new IllegalArgumentException("유효하지 않은 FAQ 카테고리 코드입니다: " + dto.getFaqTypeCd());
        }
    	
    	if (!"Y".equals(dto.getFaqIsDeletedYn()) && !"N".equals(dto.getFaqIsDeletedYn())) {
            throw new IllegalArgumentException("상태값은 Y 또는 N만 가능합니다. 입력값: " + dto.getFaqIsDeletedYn());
        }
    	
        FaqEntity faq = FaqEntity.builder()
                .faqTypeCd(dto.getFaqTypeCd())
                .questionTtl(dto.getQuestionTtl())
                .answerCn(dto.getAnswerCn())
                .faqIsDeletedYn("N")
                .build();

        adminFaqMapper.insertFaq(faq);
    }

    /**
     * FAQ 수정
     */
    @Transactional
    public void modifyFaq(AdminFaqCreateRequestDTO dto, Long faqSq) {
    	
    	// 1.카테고리 번호 검증
    	if (!FaqType.isValidCode(dto.getFaqTypeCd())) {
            throw new IllegalArgumentException("유효하지 않은 FAQ 카테고리 코드입니다: " + dto.getFaqTypeCd());
        }
    	
    	if (!"Y".equals(dto.getFaqIsDeletedYn()) && !"N".equals(dto.getFaqIsDeletedYn())) {
            throw new IllegalArgumentException("상태값은 Y 또는 N만 가능합니다. 입력값: " + dto.getFaqIsDeletedYn());
        }
    	
        FaqEntity faq = FaqEntity.builder()
                .faqSq(faqSq)
                .faqTypeCd(dto.getFaqTypeCd())
                .questionTtl(dto.getQuestionTtl())
                .answerCn(dto.getAnswerCn())
                .build();

        adminFaqMapper.updateFaq(faq);
    }

    /**
     * FAQ 상태 변경 (삭제/복구)
     */
    @Transactional
    public void changeDeleteStatus(Long faqSq, String isDeletedYn) {
    	
    	if (!"Y".equals(isDeletedYn) && !"N".equals(isDeletedYn)) {
            throw new IllegalArgumentException("상태값은 Y 또는 N만 가능합니다. 입력값: " + isDeletedYn);
        }
        adminFaqMapper.updateDeleteStatus(faqSq, isDeletedYn);
    }
}