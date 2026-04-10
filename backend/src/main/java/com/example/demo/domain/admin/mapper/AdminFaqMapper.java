package com.example.demo.domain.admin.mapper;

import com.example.demo.domain.admin.dto.response.AdminFaqDetailResponseDTO;
import com.example.demo.domain.admin.entity.FaqEntity;
import com.example.demo.domain.affiliation.dto.request.SearchFilterRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AdminFaqMapper {

    // 1. FAQ 목록 조회 (검색 및 페이징)
	List<AdminFaqDetailResponseDTO> findAll(@Param("request") SearchFilterRequest request);
	
    // 2. 검색 조건에 맞는 전체 카운트 (페이징용)
	Long countAll(@Param("request") SearchFilterRequest request);

    // 3. 상세 조회 (수정 및 상세 확인용)
    AdminFaqDetailResponseDTO findBySq(@Param("faqSq") Long faqSq);

    // 4. FAQ 등록
    void insertFaq(FaqEntity faq);
    
    // 5. FAQ 수정
    void updateFaq(FaqEntity faq);
    
    // 6. 상태 업데이트 (삭제/복구 통합: 파라미터로 'Y' 또는 'N' 전달)
    void updateDeleteStatus(@Param("faqSq") Long faqSq, @Param("isDeletedYn") String isDeletedYn);
}