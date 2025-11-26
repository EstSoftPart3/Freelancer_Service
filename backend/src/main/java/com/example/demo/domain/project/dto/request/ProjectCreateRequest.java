package com.example.demo.domain.project.dto.request;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;

public record ProjectCreateRequest(
		long projectId,
		@NotBlank(message = "프로젝트 제목은 필수입니다.")
	    String projectTitle,

	    String projectImageUrl,
	    
	    @NotNull(message = "단가 필수입니다.")
	    Long projectSalary,

	    @NotBlank(message = "하위 행정구역 코드는 필수입니다.")
	    Long subDistrictCode,
	    
	    @NotBlank(message = "하위 행정구역 이름은 필수입니다.")
	    String subDistrictName,
	    

	    @NotBlank(message = "하위 행정구역 위도는 필수입니다.")
	    Double districtLat,
	    
	    @NotBlank(message = "하위 행정구역 경도는 필수입니다.")
	    Double districtLon,
	    

	    @NotBlank(message = "개발자 등급은 필수입니다.")
	    String devGrade,

	    @NotBlank(message = "학력은 필수입니다.")
	    String educationLvl,

	    @NotNull(message = "프로젝트 시작일은 필수입니다.")
	    LocalDate projectStartDt,

	    @NotNull(message = "프로젝트 종료일은 필수입니다.")
		LocalDate projectEndDt,

		@NotNull(message = "모집 시작일은 필수입니다.")
		LocalDate recruitStartDt,

		@NotNull(message = "모집 종료일은 필수입니다.")
		LocalDate recruitEndDt,

	    @NotEmpty(message = "근무 형태는 필수입니다.")
	    List<String> workType,

	    @NotEmpty(message = "모집 직군은 필수입니다.")
	    List<String> recruitJob,

	    @NotEmpty(message = "사용 기술은 필수입니다.")
	    List<String> usingSkills,

	    @NotEmpty(message = "우대 기술은 필수입니다.")
	    List<String> preferSkills,

	    @Size(max = 255, message = "우대 사항은 255자를 초과할 수 없습니다.")
	    String preference,

	    @Size(max = 1000, message = "상세 설명은 1000자를 초과할 수 없습니다.")
	    String description,

	    @NotNull(message = "인터뷰 가능 시간은 필수입니다.")
	    List<LocalDateTime> interviewTime,

	    @NotNull(message = "알림 여부는 필수입니다.")
	    String isNotification
) {
}
