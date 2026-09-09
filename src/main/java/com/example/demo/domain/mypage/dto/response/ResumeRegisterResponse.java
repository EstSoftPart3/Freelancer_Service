package com.example.demo.domain.mypage.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.example.demo.domain.affiliation.dto.response.ResumeSkillResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeRegisterResponse {
    private Long resumeSq;             // 생성된 이력서 PK
    private String resumeTtl;          // 이력서 제목
    private boolean representative;    // 대표 이력서 여부
    private Long userSq;
    private Long addressSq;
    private String resumeNm;
    private String resumePhotoUrl;
    private LocalDate resumeBirthDt;
    private String resumePhoneNum;
    private String resumeEmail;
    private String resumeGreetingTxt;
    private String resumeIsNotificationYn;
    private String resumeIsRepresentativeYn;
    private String zonecode;
    private String address;
    private String detailAddress;
    private String sigungu;
    private String sido;
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    private List<ResumeEducationResponse> education;
    private List<ResumeCareerResponse> career;
    private List<ResumeProjectResponse> projects;
    private List<ResumeCertificateResponse> certificates;
    private List<ResumeSkillResponse> skills;
    //private List<ResumeAttachmentResponse> attachments;
} 
