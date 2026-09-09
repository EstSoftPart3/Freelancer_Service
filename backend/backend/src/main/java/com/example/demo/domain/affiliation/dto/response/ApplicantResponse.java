package com.example.demo.domain.affiliation.dto.response;

import com.example.demo.domain.affiliation.entity.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;
import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantResponse{
//	소속 지원자 정보 (기업)
    private String userNm; // 이름
    private Long career; // 경력
    private List<ResumeSkillResponse> skills; // 사용 기슐
    private Long applicationSq; // 지원 순번
    private LocalDateTime createdAt; // 지원 일자
    private LocalDateTime readAt; // 열람 일자
    private Long statusCd; // 지원 상태 코드
    
    public static ApplicantResponse fromEntity(String userNm, List<Career> careers, CompanyApplication companyApplication, List<ResumeSkillTag> skillTags) {
    	Long month = careers.stream().filter(career -> career.getCareerStartDt() != null && career.getCareerEndDt() != null)
                .mapToLong(career -> {
                	LocalDate start = career.getCareerStartDt();
                    LocalDate end = career.getCareerEndDt();

                    if (end.isBefore(start)) return 0; // 시작일보다 종료일이 빠른 경우 예외처리

                    Period period = Period.between(start, end);
                    return period.getYears() * 12L + period.getMonths();
                })
                .sum();
    	List<ResumeSkillResponse> skills = skillTags.stream().filter(tag -> tag != null).map(tag -> ResumeSkillResponse.fromEntity(tag)).collect(java.util.stream.Collectors.toList());
    	return new ApplicantResponse(
			userNm,
			month,
			skills,
			companyApplication.getCompanyApplicationSq(),
			companyApplication.getCompanyApplicationCreatedAtDtm(),
			companyApplication.getCompanyApplicationReadAtDtm(),
			companyApplication.getCompanyApplicationStatusCd()
			
		);
    }
    
    
}