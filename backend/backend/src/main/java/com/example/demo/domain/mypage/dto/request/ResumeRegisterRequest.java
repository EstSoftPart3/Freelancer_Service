package com.example.demo.domain.mypage.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumeRegisterRequest {
    private Long userSq;
    private Long addressSq;
    private String resumeTtl;
    private String resumePhotoUrl;
    private String resumeNm;
    private Long resumeSq;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate resumeBirthDt;
    private String resumePhoneNum;
    private String resumeEmail;
    private String resumeGreetingTxt;
    private String resumeIsNotificationYn;
    private String resumeIsRepresentativeYn;
    //학력, 경력, 프로젝트, 자격증, 첨부파일
    private List<ResumeEducationRequest> education;
    private List<ResumeCareerRequest> career;
    private List<ResumeProjectRequest> projects;
    private List<ResumeCertificateRequest> certificates;
    private List<ResumeSkillRequest> skills;
    private List<ResumeAttachmentRequest> attachments;

    // 주소 관련
    private String zonecode;
    private String address;
    private String detailAddress;
    private String sigungu;
    private String sido;
    private BigDecimal latitude;
    private BigDecimal longitude;

}
