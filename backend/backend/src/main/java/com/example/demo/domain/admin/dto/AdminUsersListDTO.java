package com.example.demo.domain.admin.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.domain.community.dto.SkillTagDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUsersListDTO {
    private Long userSq;
    private Long userTypeCd;
    private String userId;
    private String profileImageUrl;
    private String userNm;
    private String companyNm;
    private Long companySq;
    private String userEmail;
    private String userPhoneNum;
    private Long userGenderCd;
    private LocalDate userBirthDt;
    private LocalDateTime userCreatedDtm;
    private LocalDateTime userModifiedDtm;
    private String userIsDeletedYn;
    private Long userSignupTypeCd;
    private String userIsActivateYn;
    private String userAgreedPrivacyPolicyYn;
}
