package com.example.demo.domain.project.dto;

import com.example.demo.domain.project.dto.request.ProjectCreateRequest;

import jakarta.persistence.criteria.From;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AddressInsertDto {
	private Long addressSq;       // 반환 받을 키
    private String districtName;
    private Long districtCode;
    private Double districtLat;
    private Double districtLon;
    
    public static AddressInsertDto from(ProjectCreateRequest request) {
    	return AddressInsertDto.builder()
    			.districtName(request.subDistrictName())
    			.districtCode(request.subDistrictCode())
    			.districtLat(request.districtLat())
    			.districtLon(request.districtLon())
    			.build();
    }
}
