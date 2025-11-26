package com.example.demo.domain.project.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.project.dto.AddressInsertDto;
import com.example.demo.domain.project.dto.response.AreaInfoResponse;

@Mapper
public interface AddressMapper {
	String findAddressBySq(@Param("addressSq") Long addressSq);
	Long createAddress(@Param("dto") AddressInsertDto dto,@Param("areaCodeSq") Long areaCodeSq);
	AreaInfoResponse findAreaInfoBySq(@Param("addressSq") Long addressSq);
	Long selectAreaCodeBySidoAndSigungu( @Param("sigungu") String sigungu);
}
