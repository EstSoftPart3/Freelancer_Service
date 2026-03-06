package com.example.demo.domain.admin.dto.request;

import org.springframework.web.multipart.MultipartFile;

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
public class AdminUsersUpdateRequestDTO {
    private String userNm;
    private String userEmail;
    private String userPhoneNum;
    private Long userTypeCd;
    private Long userGenderCd;
    private String userIsActivateYn;
    private String userIsDeletedYn;
    private String userAgreedPrivacyPolicyYn;
    private String companyNm;
    private String userPw;
    private MultipartFile profileImage;
}
