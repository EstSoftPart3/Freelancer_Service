package com.example.demo.domain.affiliation.dto.response;

import java.time.LocalDate;

import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AffiliationProjectDTO {
	// 프로젝트 순번
	private Long projectSq;
	// 프로젝트 제목
	private String projectTtl;
	// 프로젝트 상세 내용
	private String projectDescriptionTxt;
	// 프로젝트 수행일
	private LocalDate projectStartDt;
	// 프로젝트 수행 종료일
	private LocalDate projectEndDt;
	// 프로젝트 우대 사항
	private String projectPreferenceTxt;
	// 프로젝트 지원자 수
	private int projectCandidateCnt;
	// 프로젝트 삭제 여부 N
	private String projectIsDeletedYn;

}
