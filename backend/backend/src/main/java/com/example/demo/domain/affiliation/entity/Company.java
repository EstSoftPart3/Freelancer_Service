package com.example.demo.domain.affiliation.entity;

import java.time.LocalDate;

import lombok.Data;

@Data
public class Company {
	private Long companySq;
    private Long userSq; // 사용자 순번 (회원 가입 후 연관된 user_sq)
    private Long addressSq; // 주소지 순번 (주소 테이블 사용 시)

    private String companyNm; // 기업명
    private String companyCeoNm; // 대표자명
    private LocalDate companyOpenDt; // 개업일자
    private String companyUrl; // 기업 URL (선택)
    private String companyBizNum; // 사업자등록번호
    private String companyIsRecruitingYn; // 모집 여부 (Y/N)
    private String companyProfileImageUrl; // 프로필 이미지 URL (선택)
    private String companyGreetingTxt; // 인사말 (선택)
    private Long companyViewCnt; // 조회수
}
