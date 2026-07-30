package com.example.demo.domain.admin.dto.response;

import lombok.*;


/**
 * 관리자가 회사 소속 정보를 위해 필요한 DTO
 */

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsersCompanyListResponseDTO {
    // 유저 정보
    private Long userTypeCd;
    private Long userSq;
    private String userId;
    private String userNm;
    private String userPhoneNum;

    // 회사 정보
    private Long companySq;
    private String companyNm;
    private String companyCeoNm;
    private String companyOpenDt;
    private String companyUrl;
    private String companyBizNum;
    /** 사업자 인증 상태 (2501 미인증 / 2502 인증완료). BO 소속 관리 목록의 뱃지에 쓴다. */
    private Long companyAuthStatusCd;
    /**
     * 현재 소속원 수 — 재직 중(상태 401, 탈퇴일 없음)만 센다.
     * 소속 관리 화면에서 "빈 소속"을 골라내는 데 쓴다.
     */
    private Integer memberCnt;

    // 주소 정보 (tbl_address_s 조인)
//    private Long companyZonecode;
    private String companyAddress;
    private String companyDetailAddress;
//    private String companySigungu;
}
