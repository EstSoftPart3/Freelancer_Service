package com.example.demo.domain.mypage.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.domain.project.dto.response.RecruitHeadcountResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectScrapDTO {
    private Long projectSq;
    private String projectTtl;
    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;
    private int candidateCnt;
    private LocalDateTime createdAt;
    private CompanyDTO company;
    private ProjectScrapAddressDTO address;
    private String requiredEducation;
    /** 대표 등급(최저). 등급별 목록이 비어 있는 옛 공고의 폴백으로 남긴다 */
    private String developerGrade;
    /** 모집 등급 전부. 여러 등급을 뽑는 공고가 대표 하나로만 보이지 않게 한다 */
    private List<RecruitHeadcountResponse> recruitHeadcounts;
    private List<String> skillTags;
    private long dDay;
}
