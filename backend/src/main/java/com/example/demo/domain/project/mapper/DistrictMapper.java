package com.example.demo.domain.project.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.project.dto.response.AreaInfoResponse;

@Mapper
public interface DistrictMapper {
	List<AreaInfoResponse> findAllParentDistrict();

	List<AreaInfoResponse> findAllDistrictByParent(@Param("parentCodeSq") Long parentCodeSq);

	AreaInfoResponse findParentDisctrictByCodeSq(@Param("codeSq") Long codeSq);

	Long findAreaCodeBySigunguName(@Param("sigunguName") String sigunguName);

	// 시도명으로 범위를 좁혀 시군구 코드를 찾는다. 「중구」·「남구」처럼 이름이 겹치는 시군구가 있어
	// findAreaCodeBySigunguName(LIMIT 1) 만으로는 엉뚱한 지역이 잡힌다.
	Long findAreaCodeBySidoAndSigungu(@Param("sidoName") String sidoName,
			@Param("sigunguName") String sigunguName);

	String findSigunguByCode(@Param("areaCodeSq") Long areaCodeSq);
}
