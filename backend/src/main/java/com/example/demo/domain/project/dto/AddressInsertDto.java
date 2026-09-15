package com.example.demo.domain.project.dto;

import com.example.demo.domain.project.dto.request.ProjectCreateRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AddressInsertDto {
	private Long addressSq;
	private Long zonecode;
	private String address;
	private String detailAddress;
	private String sigungu;
	private Double latitude;
	private Double longitude;
	private Long areaCodeSq;

	// 상세주소 등록용 변환 메서드
	public static AddressInsertDto forDetailed(ProjectCreateRequest request) {
		return AddressInsertDto.builder()
				.address(request.detailedAddressName())
				.detailAddress(request.detailedAddressDetail())
				.zonecode(request.detailedZonecode())
				.latitude(request.detailedLat())
				.longitude(request.detailedLon())
				.areaCodeSq(parseSigunguCode(request.detailedSigunguCode()))
				.build();
	}

	// 지하철주소 등록용 변환 메서드
	public static AddressInsertDto forSubway(ProjectCreateRequest request) {
		return AddressInsertDto.builder()
				.address(request.subwayAddressName())
				.latitude(request.subwayLat())
				.longitude(request.subwayLon())
				.areaCodeSq(parseSigunguCode(request.subwaySigunguCode()))
				.build();
	}

	/**
	 * 시군구 코드는 다음 우편번호 API 가 항상 숫자로 주지만, 클라이언트가 임의 문자열을 보내면
	 * {@link Long#parseLong}이 처리되지 않은 500 을 던진다 — 400 으로 명확히 응답하도록 방어한다.
	 */
	private static Long parseSigunguCode(String code) {
		if (code == null || code.isBlank()) {
			return null;
		}
		try {
			return Long.parseLong(code);
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException("시군구 코드 형식이 올바르지 않습니다.");
		}
	}
}