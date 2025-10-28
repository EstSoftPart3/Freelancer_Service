package com.example.demo.domain.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMemberResponse {
    private Long userSq;
    private String userId;
    private String userNm;
    private String userEmail;
    private String userPhoneNum;
    private LocalDate userBirthDt;
    private String userTypeCdNm; // "개인" or "기업"
    private Long userTypeCd;
    private String userIsActivateYn; // "Y"(활성) or "N"(비활성)
    private String genderNm; // 성별명
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 기업인 경우 추가 정보
    private String companyNm;
    private String companyCeoNm;
    private String companyBizNum;
}

