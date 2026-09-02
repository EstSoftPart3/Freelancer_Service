package com.example.demo.domain.project.dto.request;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
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

		// 종료일은 비워 둘 수 있다 — 끝나는 날을 정하지 않고 시작하는 현장이 있다. null 이면 "미정".
		LocalDate projectEndDt,

		@NotNull(message = "모집 시작일은 필수입니다.") LocalDate recruitStartDt,

		@NotNull(message = "모집 종료일은 필수입니다.") LocalDate recruitEndDt,

		@NotEmpty(message = "근무 형태는 필수입니다.") List<String> workType,

		@NotEmpty(message = "모집 직군은 필수입니다.") List<String> recruitJob,

		@NotEmpty(message = "사용 기술은 필수입니다.") List<String> usingSkills,

		// 우대 기술은 선택 항목이다 (없이도 등록 가능).
		List<String> preferSkills,

		@Size(max = 255, message = "우대 사항은 255자를 초과할 수 없습니다.") String preference,

		@Size(max = 1000, message = "상세 설명은 1000자를 초과할 수 없습니다.") String description,

		@NotNull(message = "인터뷰 가능 시간은 필수입니다.") List<LocalDateTime> interviewTime,

		@NotNull(message = "알림 여부는 필수입니다.") String isNotification,

		/**
		 * 모집 인원. 등급별 여러 행이거나, 등급이 null 인 총원 한 행이다.
		 * 인원 개념이 없던 시절에 등록된 공고가 있으므로 조회 쪽은 비어 있는 경우를 견뎌야 한다.
		 */
		@Valid @NotEmpty(message = "모집 인원은 필수입니다.") List<RecruitHeadcountRequest> recruitHeadcounts) {

	/*
	 * 날짜 4개의 관계 검증. 종전에는 @NotNull만 있어 "3월에 끝나는 프로젝트를 12월까지 모집"하는
	 * 공고가 실제로 등록돼 있었다(sq 105·108). 프런트도 두 개의 DateRangeModal이 서로의 값을
	 * 모르는 구조라 막지 못했으므로, 최종 방어선은 여기다.
	 *
	 * 필드가 null이면 통과시킨다 — 그건 위의 @NotNull이 잡을 몫이고, 여기서 또 잡으면
	 * 사용자에게 원인과 무관한 메시지가 나간다.
	 */

	/*
	 * 주소가 있으면 좌표도 반드시 함께 와야 한다.
	 *
	 * 프런트는 다음 우편번호 검색으로 주소를 받고 카카오 지오코딩을 따로 호출해 좌표를 채우는데,
	 * 그 호출이 늦거나 실패해도 화면에는 주소가 멀쩡히 보인다. 그대로 제출되면 TBL_ADDRESS_S 의
	 * latitude NOT NULL 에서 터져 500 이 됐다(2026-09-02 운영 장애, 24시간에 95건).
	 * 여기서 막으면 원인이 분명한 400 으로 돌려줄 수 있다.
	 */
	@AssertTrue(message = "주소의 좌표를 확인하지 못했습니다. 주소를 다시 검색해주세요.")
	public boolean isDetailedAddressGeocoded() {
		if (detailedAddressName == null || detailedAddressName.isBlank()) {
			return true;
		}
		return detailedLat != null && detailedLon != null;
	}

	@AssertTrue(message = "지하철역의 좌표를 확인하지 못했습니다. 역을 다시 선택해주세요.")
	public boolean isSubwayAddressGeocoded() {
		if (subwayAddressName == null || subwayAddressName.isBlank()) {
			return true;
		}
		return subwayLat != null && subwayLon != null;
	}

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

	/*
	 * 모집 인원의 두 모드가 섞이지 않게 한다. 등급이 있는 행과 없는 행이 함께 오면 화면에
	 * 무엇을 보여줄지 정할 수 없다.
	 */
	@AssertTrue(message = "모집 인원은 '등급별' 또는 '총원' 중 한 방식으로만 입력할 수 있습니다.")
	public boolean isHeadcountModeConsistent() {
		if (recruitHeadcounts == null || recruitHeadcounts.isEmpty()) {
			return true;
		}
		long byGrade = recruitHeadcounts.stream().filter(h -> h.grade() != null && !h.grade().isBlank()).count();
		// 전부 등급별이거나, 전부 총원(=행 1개)이어야 한다.
		return byGrade == recruitHeadcounts.size() || (byGrade == 0 && recruitHeadcounts.size() == 1);
	}

	@AssertTrue(message = "같은 등급을 두 번 입력할 수 없습니다.")
	public boolean isHeadcountGradeUnique() {
		if (recruitHeadcounts == null) {
			return true;
		}
		List<String> grades = recruitHeadcounts.stream()
				.map(RecruitHeadcountRequest::grade)
				.filter(g -> g != null && !g.isBlank())
				.toList();
		return grades.size() == grades.stream().distinct().count();
	}
}