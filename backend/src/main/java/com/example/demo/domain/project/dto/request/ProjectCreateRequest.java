package com.example.demo.domain.project.dto.request;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectCreateRequest(
		long projectId,
		@NotBlank(message = "프로젝트 제목은 필수입니다.") String projectTitle,

		String projectImageUrl,

		@NotNull(message = "단가는 필수입니다.") Long projectSalary,

		// [추가] 단가 협의 여부 (Y/N)
		@NotBlank(message = "단가 협의 여부는 필수입니다.") String projectSalaryNegotiableYn,

		// --- 상세 주소 관련 필드 (Optional) ---
		String detailedAddressName, // 전체 주소 (도로명/지번)
		String detailedAddressDetail, // 고객 입력 상세 주소
		Long detailedZonecode, // 우편번호
		Double detailedLat, // 위도
		Double detailedLon, // 경도
		String detailedSigunguCode, // 시군구 명칭 (대조용)

		// --- 지하철역 주소 관련 필드 (Optional) ---
		String subwayAddressName, // 지하철역 명칭 또는 주소
		Double subwayLat, // 위도
		Double subwayLon, // 경도
		String subwaySigunguCode, // 카카오 Places API 후 정제된 시군구 명칭 (대조용)

		@NotBlank(message = "개발자 등급은 필수입니다.") String devGrade,

		@NotBlank(message = "학력은 필수입니다.") String educationLvl,

		@NotNull(message = "프로젝트 시작일은 필수입니다.") LocalDate projectStartDt,

		@NotNull(message = "프로젝트 종료일은 필수입니다.") LocalDate projectEndDt,

		@NotNull(message = "모집 시작일은 필수입니다.") LocalDate recruitStartDt,

		@NotNull(message = "모집 종료일은 필수입니다.") LocalDate recruitEndDt,

		@NotEmpty(message = "근무 형태는 필수입니다.") List<String> workType,

		@NotEmpty(message = "모집 직군은 필수입니다.") List<String> recruitJob,

		@NotEmpty(message = "사용 기술은 필수입니다.") List<String> usingSkills,

		@NotEmpty(message = "우대 기술은 필수입니다.") List<String> preferSkills,

		@Size(max = 255, message = "우대 사항은 255자를 초과할 수 없습니다.") String preference,

		@Size(max = 1000, message = "상세 설명은 1000자를 초과할 수 없습니다.") String description,

		@NotNull(message = "인터뷰 가능 시간은 필수입니다.") List<LocalDateTime> interviewTime,

		@NotNull(message = "알림 여부는 필수입니다.") String isNotification) {

	/*
	 * 날짜 4개의 관계 검증. 종전에는 @NotNull만 있어 "3월에 끝나는 프로젝트를 12월까지 모집"하는
	 * 공고가 실제로 등록돼 있었다(sq 105·108). 프런트도 두 개의 DateRangeModal이 서로의 값을
	 * 모르는 구조라 막지 못했으므로, 최종 방어선은 여기다.
	 *
	 * 필드가 null이면 통과시킨다 — 그건 위의 @NotNull이 잡을 몫이고, 여기서 또 잡으면
	 * 사용자에게 원인과 무관한 메시지가 나간다.
	 */

	@AssertTrue(message = "모집 시작일은 모집 종료일보다 늦을 수 없습니다.")
	public boolean isRecruitPeriodOrdered() {
		if (recruitStartDt == null || recruitEndDt == null) {
			return true;
		}
		return !recruitStartDt.isAfter(recruitEndDt);
	}

	@AssertTrue(message = "프로젝트 시작일은 종료일보다 늦을 수 없습니다.")
	public boolean isProjectPeriodOrdered() {
		if (projectStartDt == null || projectEndDt == null) {
			return true;
		}
		return !projectStartDt.isAfter(projectEndDt);
	}

	/*
	 * 모집 종료가 수행 시작보다 뒤인 것은 허용한다 — 수행 중 인력을 추가 모집하는 공고가 정상적으로
	 * 존재한다. 다만 수행이 끝난 뒤까지 모집하는 것은 어떤 해석으로도 성립하지 않는다.
	 */
	@AssertTrue(message = "모집 종료일은 프로젝트 수행 종료일보다 늦을 수 없습니다.")
	public boolean isRecruitEndWithinProjectPeriod() {
		if (recruitEndDt == null || projectEndDt == null) {
			return true;
		}
		return !recruitEndDt.isAfter(projectEndDt);
	}
}