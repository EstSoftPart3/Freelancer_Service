package com.example.demo.domain.admin.dto.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsersUpdateRequestDTO {
    private String userNm;
    private String userEmail;
    private String userPhoneNum;
    private Long userTypeCd;
    private Long userGenderCd;
    private LocalDate userBirthDt;
    private String userIsActivateYn;
    private String userIsDeletedYn;
    private String userAgreedPrivacyPolicyYn;
    private String companyNm;
    private Long companySq;
    private String affiliationAction; // JOIN | LEAVE | CHANGE | NONE
    private String userPw;
    private MultipartFile profileImage;
}
