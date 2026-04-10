package com.example.demo.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.AdminFaqListDTO;
import com.example.demo.domain.admin.dto.request.AdminFaqCreateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminFaqDetailResponseDTO;
import com.example.demo.domain.admin.service.AdminFaqService;
import com.example.demo.domain.affiliation.dto.request.SearchFilterRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/faq") // 관리자 FAQ 공통 경로
@RequiredArgsConstructor
public class AdminFaqController {

    private final AdminFaqService adminFaqService;

    /**
     * FAQ 등록
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> registerFaq(@RequestBody AdminFaqCreateRequestDTO dto) {
    	
    	// 1. 방어 로직: Y 또는 N만 허용
    	if (!"Y".equals(dto.getFaqIsDeletedYn()) && !"N".equals(dto.getFaqIsDeletedYn())) {
            throw new IllegalArgumentException("유효하지 않은 상태값입니다. (입력값: " + dto.getFaqIsDeletedYn() + ")");
        }
    	
        adminFaqService.registerFaq(dto);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED,"정상적으로 등록되었습니다.", null));
    }
    
    /**
     * FAQ 목록 조회 (검색/페이징 포함)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminFaqListDTO>> getFaqList(
            @RequestParam(value = "faqTypeCd", required = false) Long faqTypeCd,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

    	SearchFilterRequest request = SearchFilterRequest.builder()
                .faqTypeCd(faqTypeCd != null ? String.valueOf(faqTypeCd) : null)
                .keyword(keyword)
                .page(page)
                .size(size)
                .offset((page - 1) * size)
                .build();

    	AdminFaqListDTO result = adminFaqService.getFaqList(request);
    	
        // 서비스에서 AdminFaqListDTO를 반환함
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "FAQ 목록 조회 성공", result));
    }
    
    /**
     * FAQ 상세 조회
     */
    @GetMapping("/{faqSq}")
    public ResponseEntity<ApiResponse<AdminFaqDetailResponseDTO>> getFaqDetail(@PathVariable Long faqSq) {
    	AdminFaqDetailResponseDTO a = adminFaqService.getFaqDetail(faqSq);
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"FAQ 상세 조회 성공", a));
    }

    /**
     * FAQ 수정
     */
    @PutMapping("/{faqSq}")
    public ResponseEntity<String> modifyFaq(
            @PathVariable Long faqSq, 
            @RequestBody AdminFaqCreateRequestDTO dto) {
    	
    	// 1. 방어 로직: Y 또는 N만 허용
    	if (!"Y".equals(dto.getFaqIsDeletedYn()) && !"N".equals(dto.getFaqIsDeletedYn())) {
            throw new IllegalArgumentException("유효하지 않은 상태값입니다. (입력값: " + dto.getFaqIsDeletedYn() + ")");
        }
        
        // 서비스의 modifyFaq 호출 시 경로의 faqSq를 같이 넘겨줌
        adminFaqService.modifyFaq(dto, faqSq);
        return ResponseEntity.ok("수정되었습니다.");
    }

    /**
     * FAQ 상태 변경 (삭제/복구)
     */
    @DeleteMapping("/{faqSq}/status")
    public ResponseEntity<ApiResponse<Object>> changeStatus(
            @PathVariable Long faqSq, 
            @RequestParam String isDeletedYn) {
    	
    	// 1. 방어 로직: Y 또는 N만 허용
    	if (!"Y".equals(isDeletedYn) && !"N".equals(isDeletedYn)) {
            throw new IllegalArgumentException("유효하지 않은 상태값입니다. (입력값: " + isDeletedYn + ")");
        }
        
        // 2. 서비스 로직 호출
        adminFaqService.changeDeleteStatus(faqSq, isDeletedYn);
        
        // 3. 삼항 연산자로 메시지 처리
        String message = "Y".equals(isDeletedYn) ? "성공적으로 삭제되었습니다." : "성공적으로 복구되었습니다.";
        
        // 4. 리턴 타입에 맞춰 ApiResponse 반환
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, message, null));
    }
}