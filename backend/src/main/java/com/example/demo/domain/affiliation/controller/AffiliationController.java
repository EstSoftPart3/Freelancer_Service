package com.example.demo.domain.affiliation.controller;


import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.affiliation.service.AffiliationService;
import com.example.demo.domain.affiliation.dto.response.*;
import com.example.demo.domain.affiliation.dto.request.*;
import com.example.demo.domain.affiliation.entity.*;

import lombok.RequiredArgsConstructor;

import javax.lang.model.type.NullType;
import java.util.*;


@RestController
@RequestMapping("/affiliation")
@RequiredArgsConstructor
public class AffiliationController {

    private final AffiliationService affiliationService;
    
    // 소속 공고 리스트 조회
    @GetMapping
    public ResponseEntity<ApiResponse<AffiliationListResponse>> getAllAffiliations(
    		@AuthenticationPrincipal Long userSq,
    		@RequestParam(value = "searchType", required = false) String searchType, 
    		@RequestParam(value = "keyword", required = false) String keyword,
    		@RequestParam(value = "sortType", defaultValue = "latest") String sortType,
    		@RequestParam(value = "addressCd", required = false) Long addressCd,
    		@RequestParam(value = "page", defaultValue = "1") Long page,
    		@RequestParam(value = "size", defaultValue = "10") Long size){
    	if(page < 1) page = 1L;
    	Long offset = (page - 1L) * size;
    	SearchFilterRequest searchFilter = SearchFilterRequest.builder().searchType(searchType).keyword(keyword).sortType(sortType).addressCd(addressCd).page(page).size(size).offset(offset).build();
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 공고 목록 조회 성공", affiliationService.getAllAffiliations(userSq, searchFilter)));
    }
    
    // 소속 공고 스크랩
    @PostMapping("/{companySq}/scrap")
    public ResponseEntity<ApiResponse<NullType>> scrapAffiliation(@AuthenticationPrincipal Long userSq, @PathVariable("companySq") Long companySq) {
    	affiliationService.updateCompanyRecommend(userSq, companySq);
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "스크랩 반영이 완료되었습니다.", null));
    }
    
    // 소속 조회수 증가
    @PatchMapping("/{companySq}/increment-view")
    public ResponseEntity<ApiResponse<NullType>> addAffiliationViewCnt(@PathVariable("companySq") Long companySq) {
    	affiliationService.addCompanyViewCnt(companySq);
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가가 완료되었습니다.", null));
    }
    
    // 소속 신청
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<NullType>> addApplication(@AuthenticationPrincipal Long userSq, @RequestBody CompanyApplication companyApplication) {
    	companyApplication.setUserSq(userSq);
    	affiliationService.addApply(companyApplication);
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "소속 신청이 완료되었습니다.", null));
    }
    
    // 소속 신청 내용 수정
//    @PutMapping("/apply")
//    public ResponseEntity<ApiResponse<NullType>> updateApplication(@AuthenticationPrincipal Long userSq, @RequestBody CompanyApplication companyApplication) {
//    	companyApplication.setUserSq(userSq);
//    	affiliationService.updateApply(companyApplication);
//    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 신청 정보 수정이 완료되었습니다.", null));
//    }
    
    // 내 소속 정보 조회
    @GetMapping("/my-info")
    public ResponseEntity<ApiResponse<MyAffiliationInfoResponse>> getMyAffiliationInfo(@AuthenticationPrincipal Long userSq) {
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "내 소속 정보 조회 성공", affiliationService.getMyAffiliationInfo(userSq)));
    }

    // 소속 탈퇴
    @PatchMapping("/leave")
    public ResponseEntity<ApiResponse<NullType>> leaveAffiliation(@AuthenticationPrincipal Long userSq) {
    	affiliationService.leaveAffiliation(userSq);
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "소속 탈퇴가 완료되었습니다.", null));
    }

    // 주소 코드 리스트 조회
    @GetMapping("/address")
    public ResponseEntity<ApiResponse<List<AreaCd>>> getAddressCds() {
    	return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "주소 코드 리스트 조회 완료.", affiliationService.getAddressList()));
    }
    

}