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
				// String을 Long으로 변환
				.areaCodeSq(request.detailedSigunguCode() != null && !request.detailedSigunguCode().isBlank()
						? Long.parseLong(request.detailedSigunguCode())
						: null)
				.build();
	}

	// 지하철주소 등록용 변환 메서드
	public static AddressInsertDto forSubway(ProjectCreateRequest request) {
		return AddressInsertDto.builder()
				.address(request.subwayAddressName())
				.latitude(request.subwayLat())
				.longitude(request.subwayLon())
				// String을 Long으로 변환
				.areaCodeSq(request.subwaySigunguCode() != null && !request.subwaySigunguCode().isBlank()
						? Long.parseLong(request.subwaySigunguCode())
						: null)
				.build();
	}
}